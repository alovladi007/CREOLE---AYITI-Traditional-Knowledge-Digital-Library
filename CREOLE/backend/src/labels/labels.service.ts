import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelEntity } from './entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(LabelEntity)
    private labelsRepository: Repository<LabelEntity>,
  ) {}

  async findAll(): Promise<LabelEntity[]> {
    return await this.labelsRepository.find({
      order: { code: 'ASC' },
    });
  }

  async create(code: string, description?: string): Promise<LabelEntity> {
    const label = this.labelsRepository.create({ code, description });
    return await this.labelsRepository.save(label);
  }

  async findByCode(code: string): Promise<LabelEntity | null> {
    return await this.labelsRepository.findOne({ where: { code } });
  }
}