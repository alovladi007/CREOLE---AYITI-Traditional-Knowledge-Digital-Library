import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RecordEntity } from './entities/record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';

@Injectable()
export class RecordsService {
  constructor(@InjectRepository(RecordEntity) private repo: Repository<RecordEntity>) {}

  async create(dto: CreateRecordDto) {
    const rec = this.repo.create(dto);
    return this.repo.save(rec);
  }

  async findAll(params: SearchRecordsDto) {
    const where: any = {};
    if (params.creole_class) where.creole_class = params.creole_class;
    if (params.access_tier) where.access_tier = params.access_tier;
    if (params.q) {
      return this.repo.find({
        where: [
          { title_ht: ILike(`%${params.q}%`) },
          { title_fr: ILike(`%${params.q}%`) },
          { abstract_en: ILike(`%${params.q}%`) },
        ],
        order: { createdAt: 'DESC' },
        take: 50
      });
    }
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}