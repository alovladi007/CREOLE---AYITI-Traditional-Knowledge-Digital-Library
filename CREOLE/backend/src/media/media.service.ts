import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client as MinioClient } from 'minio';
import * as crypto from 'crypto';
import { MediaEntity } from './media.entity';

@Injectable()
export class MediaService {
  private minio: MinioClient;
  private bucket: string;

  constructor(@InjectRepository(MediaEntity) private repo: Repository<MediaEntity>) {
    const endPoint = process.env.MINIO_ENDPOINT || 'minio';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'creoleminio';
    const secretKey = process.env.MINIO_SECRET_KEY || 'creoleminio123';
    this.bucket = process.env.MINIO_BUCKET || 'creole-media';

    this.minio = new MinioClient({ endPoint, port, useSSL, accessKey, secretKey });

    // Ensure bucket exists
    this.minio.bucketExists(this.bucket, (err, exists) => {
      if (err) { 
        console.error('MinIO check bucket error', err); 
        return; 
      }
      if (!exists) {
        this.minio.makeBucket(this.bucket, '', err2 => {
          if (err2) console.error('MinIO make bucket error', err2);
          else console.log('MinIO bucket created:', this.bucket);
        });
      }
    });
  }

  async uploadBuffer(buf: Buffer, filename: string, mimetype: string, recordId?: string): Promise<MediaEntity> {
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    const key = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${filename}`;
    await this.minio.putObject(this.bucket, key, buf, { 'Content-Type': mimetype, 'x-amz-meta-sha256': sha256 });

    const media = this.repo.create({
      key, 
      filename, 
      mimetype, 
      size: buf.length, 
      sha256, 
      recordId: recordId ?? null,
      redaction_status: mimetype.startsWith('text/') ? 'pending' : 'none'
    });
    const saved = await this.repo.save(media);
    // Ensure we return a single entity, not an array
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async presignGetUrl(key: string) {
    return new Promise<string>((resolve, reject) => {
      this.minio.presignedGetObject(this.bucket, key, 60*10, (err, url) => {
        if (err) reject(err); 
        else resolve(url);
      });
    });
  }

  private nlpUrl(): string {
    const host = process.env.NLP_HOST || 'nlp';
    const port = process.env.NLP_PORT || '8000';
    return `http://${host}:${port}`;
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      this.minio.getObject(this.bucket, key, (err, dataStream) => {
        if (err) return reject(err);
        const chunks: Buffer[] = [];
        dataStream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk)));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', (e) => reject(e));
      });
    });
  }

  async redactAfterUpload(saved: MediaEntity) {
    try {
      const mime = saved.mimetype || '';
      // Text redaction
      if (mime.startsWith('text/')) {
        const buf = await this.getObjectBuffer(saved.key);
        const text = buf.toString('utf8');
        const res = await fetch(this.nlpUrl() + '/redact_text', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ text })
        } as any);
        if (res.ok) {
          const j:any = await res.json();
          const redacted = Buffer.from(j.redacted, 'utf8');
          const redKey = saved.key.replace(/(\.[^.]+)?$/, '-redacted.txt');
          await this.minio.putObject(this.bucket, redKey, redacted, { 'Content-Type': 'text/plain' });
          saved.redaction_status = 'redacted';
          saved.redaction_meta = { redacted_key: redKey, strategy: 'pii+terms' };
          await this.repo.save(saved);
        }
      }
    } catch (e) {
      console.error('redactAfterUpload error', e);
    }
  }
}