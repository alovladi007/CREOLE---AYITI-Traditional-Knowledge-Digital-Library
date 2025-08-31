import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from '../../records/entities/record.entity';

@Entity('consents')
export class ConsentEntity extends BaseEntity {
  @ManyToOne(() => RecordEntity, { onDelete: 'CASCADE' })
  record: RecordEntity;

  @Column()
  type: string; // PIC or MAT

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'jsonb', nullable: true })
  terms: any;
}