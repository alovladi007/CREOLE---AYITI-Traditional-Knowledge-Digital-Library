import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

export type RequestStatus = 'pending' | 'approved' | 'denied';

@Entity('access_requests')
export class AccessRequestEntity extends BaseEntity {
  @Column()
  recordId: string;

  @Column()
  requester: string;

  @Column({ type: 'text' })
  purpose: string;

  @Column('simple-array', { nullable: true })
  requested_fields?: string[];

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
  })
  status: RequestStatus;

  @Column({ type: 'text', nullable: true })
  decision_note?: string;

  @Column({ nullable: true })
  decided_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  decided_at?: Date;
}