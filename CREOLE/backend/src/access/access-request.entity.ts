import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RecordEntity } from '../records/entities/record.entity';

@Entity('access_requests')
export class AccessRequestEntity extends BaseEntity {
  @ManyToOne(() => RecordEntity, { onDelete: 'CASCADE', nullable: true })
  record: RecordEntity | null;

  @Column({ nullable: true })
  recordId: string;

  @Column()
  requester: string; // Keycloak user or email

  @Column({ type: 'text' })
  purpose: string;

  @Column({ type: 'jsonb', nullable: true })
  requested_fields: any;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'denied';

  @Column({ type: 'text', nullable: true })
  decision_note: string | null;

  @Column({ type: 'varchar', nullable: true })
  decided_by: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  decided_at: Date | null;
}