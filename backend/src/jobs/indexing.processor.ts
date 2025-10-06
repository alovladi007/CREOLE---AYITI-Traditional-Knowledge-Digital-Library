import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from '../records/entities/record.entity';

@Processor('indexing')
@Injectable()
export class IndexingProcessor {
  constructor(
    @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
  ) {}

  @Process('update-search-vector')
  async handleSearchVectorUpdate(job: Job) {
    const { recordId } = job.data;

    // Update the full-text search vector for a record
    await this.recordRepo.query(`
      UPDATE records
      SET search_vector = to_tsvector('simple',
        COALESCE(title_ht, '') || ' ' ||
        COALESCE(title_fr, '') || ' ' ||
        COALESCE(abstract_en, '')
      )
      WHERE id = $1
    `, [recordId]);

    return { success: true };
  }

  @Process('reindex-all')
  async handleFullReindex(job: Job) {
    // Reindex all records
    await this.recordRepo.query(`
      UPDATE records
      SET search_vector = to_tsvector('simple',
        COALESCE(title_ht, '') || ' ' ||
        COALESCE(title_fr, '') || ' ' ||
        COALESCE(abstract_en, '')
      )
    `);

    const count = await this.recordRepo.count();
    return { success: true, reindexed: count };
  }

  @Process('update-analytics')
  async handleAnalyticsAggregation(job: Job) {
    // Aggregate analytics data for faster dashboard queries
    // This could be implemented as materialized views or summary tables
    return { success: true };
  }
}
