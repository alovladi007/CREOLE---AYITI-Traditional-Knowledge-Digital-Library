import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_relations')
export class RecordRelationEntity extends BaseEntity {
  @Column()
  @Index()
  source_record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'source_record_id' })
  source_record: RecordEntity;

  @Column()
  @Index()
  target_record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'target_record_id' })
  target_record: RecordEntity;

  @Column()
  relation_type: 'related' | 'derived_from' | 'variant_of' | 'supersedes' | 'part_of' | 'contradicts';

  @Column({ type: 'text', nullable: true })
  description: string;
}
