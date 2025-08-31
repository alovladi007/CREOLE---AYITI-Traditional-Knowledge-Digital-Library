import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessRequestEntity } from './access-request.entity';

@Injectable()
export class AccessService {
  constructor(@InjectRepository(AccessRequestEntity) private repo: Repository<AccessRequestEntity>) {}

  create(data: Partial<AccessRequestEntity>) {
    return this.repo.save(this.repo.create(data));
  }

  listInbox() {
    return this.repo.find({ where: { status: 'pending' }, order: { createdAt: 'DESC' } });
  }

  async decide(id: string, status: 'approved'|'denied', decidedBy: string, note?: string) {
    const ar = await this.repo.findOne({ where: { id } });
    if (!ar) return null;
    ar.status = status;
    ar.decided_by = decidedBy;
    ar.decision_note = note || null;
    ar.decided_at = new Date();
    return this.repo.save(ar);
  }
}