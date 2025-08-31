import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import axios from 'axios';
import { MediaEntity } from './media.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'minio',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'creoleminio',
      secretKey: process.env.MINIO_SECRET_KEY || 'creoleminio123',
    });
    
    this.bucket = process.env.MINIO_BUCKET || 'creole-media';
    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        console.log(`Created MinIO bucket: ${this.bucket}`);
      }
    } catch (error) {
      console.error('Error ensuring MinIO bucket:', error);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    recordId?: string,
  ): Promise<MediaEntity> {
    const key = `${uuidv4()}-${filename}`;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Upload to MinIO
    await this.minioClient.putObject(
      this.bucket,
      key,
      buffer,
      buffer.length,
      { 'Content-Type': mimetype },
    );

    // Save metadata
    const media = this.mediaRepository.create({
      recordId,
      key,
      filename,
      mimetype,
      size: buffer.length,
      sha256,
      redaction_status: 'none',
    });

    const saved = await this.mediaRepository.save(media);

    // Trigger redaction if text file
    if (mimetype.startsWith('text/')) {
      await this.redactAfterUpload(saved);
    }

    return saved;
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const stream = await this.minioClient.getObject(this.bucket, key);
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async presignGetUrl(key: string): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucket, key, 10 * 60); // 10 minutes
  }

  private async redactAfterUpload(media: MediaEntity): Promise<void> {
    try {
      media.redaction_status = 'pending';
      await this.mediaRepository.save(media);

      // Get original content
      const buffer = await this.getObjectBuffer(media.key);
      const text = buffer.toString('utf-8');

      // Call NLP service
      const nlpUrl = `http://${process.env.NLP_HOST || 'nlp'}:${process.env.NLP_PORT || 8000}`;
      const response = await axios.post(`${nlpUrl}/redact_text`, {
        text,
        extra_terms: [],
      });

      const redactedText = response.data.redacted_text;
      const redactedBuffer = Buffer.from(redactedText, 'utf-8');

      // Upload redacted version
      const redactedKey = media.key.replace(/(\.[^.]+)$/, '-redacted$1');
      await this.minioClient.putObject(
        this.bucket,
        redactedKey,
        redactedBuffer,
        redactedBuffer.length,
        { 'Content-Type': 'text/plain' },
      );

      // Update media entity
      media.redaction_status = 'redacted';
      media.redaction_meta = {
        redacted_key: redactedKey,
        masked_count: response.data.masked_count || 0,
      };
      await this.mediaRepository.save(media);

      console.log(`Redacted text file: ${media.key} -> ${redactedKey}`);
    } catch (error) {
      console.error('Error redacting text:', error);
      media.redaction_status = 'none';
      await this.mediaRepository.save(media);
    }
  }

  async redactImage(imageBuffer: Buffer, regions: any[]): Promise<Buffer> {
    try {
      const nlpUrl = `http://${process.env.NLP_HOST || 'nlp'}:${process.env.NLP_PORT || 8000}`;
      
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('file', blob);
      formData.append('regions', JSON.stringify(regions));

      const response = await axios.post(`${nlpUrl}/redact_image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'json',
      });

      return Buffer.from(response.data.image_base64, 'base64');
    } catch (error) {
      console.error('Error redacting image:', error);
      throw error;
    }
  }
}