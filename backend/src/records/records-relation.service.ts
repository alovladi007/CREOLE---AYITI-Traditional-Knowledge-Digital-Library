import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordRelationEntity } from './entities/record-relation.entity';
import { RecordEntity } from './entities/record.entity';

@Injectable()
export class RecordsRelationService {
  constructor(
    @InjectRepository(RecordRelationEntity) private repo: Repository<RecordRelationEntity>,
    @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
  ) {}

  async createRelation(data: {
    source_record_id: string;
    target_record_id: string;
    relation_type: 'related' | 'derived_from' | 'variant_of' | 'supersedes' | 'part_of' | 'contradicts';
    description?: string;
  }): Promise<RecordRelationEntity> {
    const relation = this.repo.create(data);
    return this.repo.save(relation);
  }

  async getRelatedRecords(recordId: string): Promise<any[]> {
    const relations = await this.repo.find({
      where: [
        { source_record_id: recordId },
        { target_record_id: recordId }
      ],
      relations: ['source_record', 'target_record']
    });

    return relations.map(rel => ({
      id: rel.id,
      relation_type: rel.relation_type,
      description: rel.description,
      related_record: rel.source_record_id === recordId ? rel.target_record : rel.source_record,
      direction: rel.source_record_id === recordId ? 'outgoing' : 'incoming'
    }));
  }

  async deleteRelation(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findSimilarRecords(recordId: string, limit = 10): Promise<RecordEntity[]> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) return [];

    // Find similar records by classification, community, and region
    const query = this.recordRepo
      .createQueryBuilder('record')
      .where('record.id != :id', { id: recordId })
      .andWhere('record.status = :status', { status: 'published' });

    let similarityScore = '';

    // Score based on matching classification
    similarityScore += `CASE WHEN record.creole_class = :class THEN 3 ELSE 0 END`;

    // Score based on matching community
    if (record.community) {
      similarityScore += ` + CASE WHEN record.community = :community THEN 2 ELSE 0 END`;
    }

    // Score based on overlapping regions
    if (record.region && record.region.length > 0) {
      similarityScore += ` + (SELECT COUNT(*) FROM jsonb_array_elements_text(record.region) AS r WHERE r = ANY(:regions))`;
    }

    // Score based on overlapping TK labels
    if (record.tk_labels && record.tk_labels.length > 0) {
      similarityScore += ` + (SELECT COUNT(*) FROM jsonb_array_elements_text(record.tk_labels) AS t WHERE t = ANY(:labels))`;
    }

    query.addSelect(`(${similarityScore})`, 'similarity_score');
    query.setParameters({
      class: record.creole_class,
      community: record.community,
      regions: record.region || [],
      labels: record.tk_labels || []
    });

    query.orderBy('similarity_score', 'DESC').limit(limit);

    return query.getMany();
  }
}
