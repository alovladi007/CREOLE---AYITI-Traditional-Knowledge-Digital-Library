import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentEntity } from './entities/consent.entity';

@Injectable()
export class ConsentsService {
  constructor(
    @InjectRepository(ConsentEntity)
    private consentsRepository: Repository<ConsentEntity>,
  ) {}

  async findAll(): Promise<ConsentEntity[]> {
    return await this.consentsRepository.find({
      relations: ['record'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRecord(recordId: string): Promise<ConsentEntity[]> {
    return await this.consentsRepository.find({
      where: { recordId },
      order: { date: 'DESC' },
    });
  }

  async create(data: Partial<ConsentEntity>): Promise<ConsentEntity> {
    const consent = this.consentsRepository.create(data);
    return await this.consentsRepository.save(consent);
  }
}