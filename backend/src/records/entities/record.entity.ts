import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

export type AccessTier = 'public' | 'restricted' | 'secret';

@Entity('records')
export class RecordEntity extends BaseEntity {
  @Column()
  title_ht: string;

  @Column({ nullable: true })
  title_fr?: string;

  @Column({ nullable: true })
  abstract_en?: string;

  @Column({ nullable: true })
  creole_class?: string; // e.g., C-FOOD, C-MED

  @Column('simple-array', { nullable: true })
  ipc_codes?: string[];

  @Column('simple-array', { nullable: true })
  tk_labels?: string[];

  @Column({
    type: 'enum',
    enum: ['public', 'restricted', 'secret'],
    default: 'public',
  })
  access_tier: AccessTier;

  @Column({ nullable: true })
  examiner_digest?: string;

  @Column({ nullable: true })
  community?: string;

  @Column('simple-array', { nullable: true })
  region?: string[];

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
}