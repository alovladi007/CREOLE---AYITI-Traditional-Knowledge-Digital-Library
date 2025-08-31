import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import axios from 'axios';
import { AuditLogEntity } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditRepository: Repository<AuditLogEntity>,
  ) {}

  async append(actor: string, action: string, details?: any): Promise<AuditLogEntity> {
    // Get last entry for hash chain
    const lastEntry = await this.auditRepository.findOne({
      order: { createdAt: 'DESC' },
    });

    const prevHash = lastEntry?.hash || '0';

    // Compute hash
    const dataToHash = JSON.stringify({
      actor,
      action,
      details,
      prevHash,
    });
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Save audit log
    const auditLog = this.auditRepository.create({
      actor,
      action,
      details,
      prev_hash: prevHash,
      hash,
    });

    const saved = await this.auditRepository.save(auditLog);

    // Anchor the hash
    await this.anchor(hash);

    return saved;
  }

  private async anchor(hash: string): Promise<void> {
    const anchorUrl = process.env.ANCHOR_URL;
    
    if (anchorUrl) {
      try {
        await axios.post(anchorUrl, {
          hash,
          ts: Date.now(),
        });
        console.log(`Anchored hash ${hash} to ${anchorUrl}`);
      } catch (error) {
        console.error('Error anchoring hash:', error);
      }
    } else {
      // Fallback to local file
      const logLine = `${new Date().toISOString()},${hash}\n`;
      try {
        await fs.appendFile('/tmp/creole-anchor.log', logLine);
        console.log(`Anchored hash ${hash} to local file`);
      } catch (error) {
        console.error('Error writing anchor log:', error);
      }
    }
  }
}