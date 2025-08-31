import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('records')
export class RecordEntity extends BaseEntity {
  @Column({ nullable: false })
  title_ht: string;

  @Column({ nullable: true })
  title_fr: string;

  @Column({ nullable: true })
  abstract_en: string;

  @Column({ nullable: false })
  creole_class: string; // e.g., C-FOOD, C-MED

  @Column({ type: 'jsonb', default: [] })
  ipc_codes: string[];

  @Column({ type: 'jsonb', default: [] })
  tk_labels: string[];

  @Column({ default: 'public' })
  access_tier: 'public' | 'restricted' | 'secret';

  @Column({ type: 'text', nullable: true })
  examiner_digest: string | null;

  @Column({ nullable: true })
  community: string;

  @Column({ type: 'jsonb', default: [] })
  region: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}