import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('export_requests')
export class ExportRequestEntity extends BaseEntity {
  @Column()
  @Index()
  user_id: string;

  @Column()
  format: 'csv' | 'json' | 'xml' | 'pdf' | 'bibtex';

  @Column({ type: 'jsonb' })
  filters: any; // Search/filter criteria used

  @Column({ default: 'pending' })
  @Index()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_size: number;

  @Column({ type: 'int', nullable: true })
  record_count: number;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;
}
