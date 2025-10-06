import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('analytics_events')
export class AnalyticsEventEntity extends BaseEntity {
  @Column()
  @Index()
  event_type: 'view' | 'search' | 'download' | 'access_request' | 'share' | 'export';

  @Column({ nullable: true })
  @Index()
  record_id: string;

  @Column({ nullable: true })
  @Index()
  user_id: string;

  @Column({ nullable: true })
  session_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // event-specific data (e.g., search terms, filters used)

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;
}
