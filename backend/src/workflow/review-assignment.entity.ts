import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RecordEntity } from '../records/entities/record.entity';

@Entity('review_assignments')
export class ReviewAssignmentEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column()
  @Index()
  reviewer_id: string;

  @Column()
  reviewer_name: string;

  @Column({ nullable: true })
  assigned_by: string;

  @Column({ default: 'pending' })
  @Index()
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'revision_requested';

  @Column({ type: 'text', nullable: true })
  review_notes: string;

  @Column({ type: 'jsonb', default: [] })
  checklist: {
    item: string;
    checked: boolean;
    notes?: string;
  }[];

  @Column({ type: 'int', nullable: true })
  quality_score: number; // 1-5 rating

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;
}
