import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

export type RedactionStatus = 'pending' | 'redacted' | 'none';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @Column({ nullable: true })
  recordId?: string;

  @Column({ unique: true })
  key: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column()
  sha256: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'redacted', 'none'],
    default: 'none',
  })
  redaction_status: RedactionStatus;

  @Column('jsonb', { nullable: true })
  redaction_meta?: Record<string, any>;
}