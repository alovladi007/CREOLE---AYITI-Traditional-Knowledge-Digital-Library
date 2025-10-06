import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('records')
export class RecordEntity extends BaseEntity {
  @Column({ nullable: false })
  @Index()
  title_ht: string;

  @Column({ nullable: true })
  @Index()
  title_fr: string;

  @Column({ nullable: true })
  @Index()
  abstract_en: string;

  @Column({ nullable: false })
  @Index()
  creole_class: string; // e.g., C-FOOD, C-MED

  @Column({ type: 'jsonb', default: [] })
  ipc_codes: string[];

  @Column({ type: 'jsonb', default: [] })
  tk_labels: string[];

  @Column({ default: 'public' })
  @Index()
  access_tier: 'public' | 'restricted' | 'secret';

  @Column({ type: 'text', nullable: true })
  examiner_digest: string | null;

  @Column({ nullable: true })
  @Index()
  community: string;

  @Column({ type: 'jsonb', default: [] })
  region: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  // Full-text search field (computed via trigger or updated on save)
  @Column({ type: 'tsvector', nullable: true, select: false })
  @Index()
  search_vector: any;

  // View count for analytics
  @Column({ type: 'int', default: 0 })
  view_count: number;

  // Status for workflow
  @Column({ default: 'draft' })
  @Index()
  status: 'draft' | 'pending_review' | 'published' | 'archived';

  // Version tracking
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ nullable: true })
  parent_version_id: string;
}