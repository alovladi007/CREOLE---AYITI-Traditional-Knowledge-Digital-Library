import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Between, In, Brackets } from 'typeorm';
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
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;
    const sortBy = params.sort_by || 'createdAt';
    const sortOrder = params.sort_order || 'DESC';

    const qb = this.repo.createQueryBuilder('record');

    // Full-text search with PostgreSQL
    if (params.q) {
      const searchTerm = params.q.trim();
      qb.andWhere(
        new Brackets(qb => {
          qb.where("to_tsvector('simple', COALESCE(record.title_ht, '')) @@ plainto_tsquery('simple', :q)", { q: searchTerm })
            .orWhere("to_tsvector('simple', COALESCE(record.title_fr, '')) @@ plainto_tsquery('simple', :q)", { q: searchTerm })
            .orWhere("to_tsvector('simple', COALESCE(record.abstract_en, '')) @@ plainto_tsquery('simple', :q)", { q: searchTerm })
            .orWhere('record.title_ht ILIKE :like', { like: `%${searchTerm}%` })
            .orWhere('record.title_fr ILIKE :like', { like: `%${searchTerm}%` })
            .orWhere('record.abstract_en ILIKE :like', { like: `%${searchTerm}%` });
        })
      );

      // Relevance ranking for full-text search
      if (sortBy === 'relevance') {
        qb.addSelect(
          `ts_rank(to_tsvector('simple', COALESCE(record.title_ht, '') || ' ' || COALESCE(record.title_fr, '') || ' ' || COALESCE(record.abstract_en, '')), plainto_tsquery('simple', :q))`,
          'rank'
        ).orderBy('rank', 'DESC');
      }
    }

    // Advanced filters
    if (params.creole_class) {
      qb.andWhere('record.creole_class = :creole_class', { creole_class: params.creole_class });
    }

    if (params.access_tier) {
      qb.andWhere('record.access_tier = :access_tier', { access_tier: params.access_tier });
    }

    if (params.community) {
      qb.andWhere('record.community = :community', { community: params.community });
    }

    // Array filters using JSONB operators
    if (params.tk_labels && params.tk_labels.length > 0) {
      qb.andWhere('record.tk_labels ?| :tk_labels', { tk_labels: params.tk_labels });
    }

    if (params.regions && params.regions.length > 0) {
      qb.andWhere('record.region ?| :regions', { regions: params.regions });
    }

    if (params.ipc_codes && params.ipc_codes.length > 0) {
      qb.andWhere('record.ipc_codes ?| :ipc_codes', { ipc_codes: params.ipc_codes });
    }

    // Date range filtering
    if (params.date_from) {
      qb.andWhere('record.createdAt >= :date_from', { date_from: new Date(params.date_from) });
    }

    if (params.date_to) {
      qb.andWhere('record.createdAt <= :date_to', { date_to: new Date(params.date_to) });
    }

    // Sorting
    if (sortBy !== 'relevance') {
      qb.orderBy(`record.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    }

    // Pagination
    qb.skip(skip).take(limit);

    const [records, total] = await qb.getManyAndCount();

    // Faceted search aggregations
    let facets = null;
    if (params.include_facets) {
      facets = await this.getFacets();
    }

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      facets,
    };
  }

  async getFacets() {
    const creoleClassFacets = await this.repo
      .createQueryBuilder('record')
      .select('record.creole_class', 'value')
      .addSelect('COUNT(*)', 'count')
      .groupBy('record.creole_class')
      .getRawMany();

    const accessTierFacets = await this.repo
      .createQueryBuilder('record')
      .select('record.access_tier', 'value')
      .addSelect('COUNT(*)', 'count')
      .groupBy('record.access_tier')
      .getRawMany();

    const communityFacets = await this.repo
      .createQueryBuilder('record')
      .select('record.community', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('record.community IS NOT NULL')
      .groupBy('record.community')
      .getRawMany();

    return {
      creole_class: creoleClassFacets,
      access_tier: accessTierFacets,
      community: communityFacets,
    };
  }

  async findOne(id: string) {
    const record = await this.repo.findOne({ where: { id } });

    // Increment view count for analytics
    if (record) {
      await this.repo.update(id, { view_count: record.view_count + 1 });
    }

    return record;
  }
}