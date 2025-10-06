import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('collaboration_sessions')
export class CollaborationSessionEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @Column({ type: 'jsonb', default: [] })
  active_users: {
    user_id: string;
    user_name: string;
    joined_at: Date;
    cursor_position?: any;
  }[];

  @Column({ type: 'jsonb', default: [] })
  pending_changes: {
    user_id: string;
    field: string;
    value: any;
    timestamp: Date;
  }[];

  @Column({ default: 'active' })
  status: 'active' | 'locked' | 'closed';

  @Column({ nullable: true })
  locked_by: string;

  @Column({ type: 'timestamp', nullable: true })
  locked_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_activity: Date;
}
