import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RecordEntity } from '../records/entities/record.entity';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @ManyToOne(() => RecordEntity, { onDelete: 'SET NULL', nullable: true })
  record: RecordEntity | null;

  @Column({ nullable: true })
  recordId: string | null;

  @Column() 
  key: string; // object key in MinIO

  @Column() 
  filename: string;

  @Column() 
  mimetype: string;

  @Column('bigint') 
  size: number;

  @Column() 
  sha256: string;

  @Column({ default: 'pending' }) 
  redaction_status: 'pending'|'redacted'|'none';

  @Column({ type: 'jsonb', nullable: true }) 
  redaction_meta: any;
}