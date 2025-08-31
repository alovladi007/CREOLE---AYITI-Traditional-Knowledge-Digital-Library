import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelEntity } from './entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(@InjectRepository(LabelEntity) private repo: Repository<LabelEntity>) {}
  
  list() { 
    return this.repo.find({ order: { code: 'ASC' } }); 
  }

  async create(code: string, description?: string): Promise<LabelEntity> {
    const label = this.repo.create({ code, description });
    return await this.repo.save(label);
  }

  async findByCode(code: string): Promise<LabelEntity | null> {
    return await this.repo.findOne({ where: { code } });
  }
}