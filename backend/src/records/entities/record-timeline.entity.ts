import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_timeline')
export class RecordTimelineEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column()
  event_type: 'historical' | 'seasonal' | 'lifecycle' | 'ceremonial' | 'practice' | 'transmission' | 'other';

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Flexible date representation
  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'int', nullable: true })
  month: number;

  @Column({ type: 'int', nullable: true })
  day: number;

  @Column({ nullable: true })
  date_precision: 'exact' | 'approximate' | 'century' | 'decade' | 'year' | 'season' | 'unknown';

  @Column({ type: 'text', nullable: true })
  date_description: string; // e.g., "During harvest season" or "Before colonial era"

  // Relative dating
  @Column({ type: 'int', nullable: true })
  sequence_order: number; // For ordering events without exact dates

  @Column({ nullable: true })
  era: string; // e.g., "Pre-colonial", "Colonial", "Post-independence"

  // Duration
  @Column({ type: 'int', nullable: true })
  duration_days: number;

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ nullable: true })
  recurrence_pattern: string; // e.g., "Annually in spring"

  // Related entities
  @Column({ type: 'jsonb', default: [] })
  participants: string[];

  @Column({ type: 'jsonb', default: [] })
  locations: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
