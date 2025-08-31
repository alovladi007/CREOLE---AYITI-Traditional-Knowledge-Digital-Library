import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AuditLogEntity } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLogEntity) private repo: Repository<AuditLogEntity>) {}

  async append(actor: string, action: string, details: any) {
    const prev = await this.repo.find({ order: { createdAt: 'DESC' }, take: 1 });
    const prevHash = prev.length ? prev[0].hash : '';
    const payload = JSON.stringify({ actor, action, details, prevHash });
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    const entry = this.repo.create({ actor, action, details, prev_hash: prevHash, hash });
    const saved = await this.repo.save(entry);
    await this.anchor(hash);
    return saved;
  }

  private async anchor(hash: string) {
    try {
      const anchorUrl = process.env.ANCHOR_URL || '';
      if (anchorUrl) {
        await fetch(anchorUrl, { 
          method: 'POST', 
          headers: { 'Content-Type':'application/json' }, 
          body: JSON.stringify({ hash, ts: Date.now() }) 
        } as any);
      } else {
        // Fallback: append to local file (container filesystem)
        const fs = await import('fs/promises');
        await fs.appendFile('/tmp/creole-anchor.log', `${Date.now()} ${hash}\n`);
      }
    } catch (e) {
      console.error('anchor error', e);
    }
  }
}