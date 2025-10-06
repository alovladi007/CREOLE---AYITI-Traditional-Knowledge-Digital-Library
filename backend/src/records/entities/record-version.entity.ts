import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_versions')
export class RecordVersionEntity extends BaseEntity {
  @Column()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column({ type: 'int' })
  version_number: number;

  @Column({ type: 'jsonb' })
  snapshot: any; // Full snapshot of the record at this version

  @Column({ type: 'jsonb', nullable: true })
  changes: any; // Diff from previous version

  @Column()
  changed_by: string; // User ID who made the change

  @Column({ type: 'text', nullable: true })
  change_reason: string;
}
