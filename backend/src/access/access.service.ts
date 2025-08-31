import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessRequestEntity, RequestStatus } from './access-request.entity';
import { RecordsService } from '../records/records.service';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessRequestEntity)
    private accessRepository: Repository<AccessRequestEntity>,
    private recordsService: RecordsService,
  ) {}

  async createRequest(data: {
    recordId: string;
    requester: string;
    purpose: string;
    requested_fields?: string[];
  }): Promise<AccessRequestEntity> {
    // Verify record exists
    const record = await this.recordsService.findOne(data.recordId);
    
    // Reject if record is public
    if (record.access_tier === 'public') {
      throw new BadRequestException('Access requests are not required for public records');
    }

    const request = this.accessRepository.create(data);
    return await this.accessRepository.save(request);
  }

  async findPending(): Promise<AccessRequestEntity[]> {
    return await this.accessRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<AccessRequestEntity> {
    const request = await this.accessRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Access request ${id} not found`);
    }
    return request;
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
    decidedBy: string,
    decisionNote?: string,
  ): Promise<AccessRequestEntity> {
    const request = await this.findById(id);
    
    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been processed');
    }

    request.status = status;
    request.decided_by = decidedBy;
    request.decided_at = new Date();
    request.decision_note = decisionNote;

    return await this.accessRepository.save(request);
  }
}