import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { RecordEntity } from './entities/record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(RecordEntity)
    private recordsRepository: Repository<RecordEntity>,
  ) {}

  async create(createRecordDto: CreateRecordDto): Promise<RecordEntity> {
    const record = this.recordsRepository.create(createRecordDto);
    return await this.recordsRepository.save(record);
  }

  async findAll(searchDto: SearchRecordsDto): Promise<RecordEntity[]> {
    const where: any = {};

    if (searchDto.q) {
      // Simple search across title fields
      return await this.recordsRepository
        .createQueryBuilder('record')
        .where('record.title_ht ILIKE :q', { q: `%${searchDto.q}%` })
        .orWhere('record.title_fr ILIKE :q', { q: `%${searchDto.q}%` })
        .orWhere('record.abstract_en ILIKE :q', { q: `%${searchDto.q}%` })
        .getMany();
    }

    if (searchDto.access_tier) {
      where.access_tier = searchDto.access_tier;
    }

    if (searchDto.community) {
      where.community = searchDto.community;
    }

    if (searchDto.creole_class) {
      where.creole_class = searchDto.creole_class;
    }

    return await this.recordsRepository.find({ where });
  }

  async findOne(id: string): Promise<RecordEntity> {
    const record = await this.recordsRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, updateRecordDto: Partial<CreateRecordDto>): Promise<RecordEntity> {
    const record = await this.findOne(id);
    Object.assign(record, updateRecordDto);
    return await this.recordsRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.recordsRepository.remove(record);
  }
}