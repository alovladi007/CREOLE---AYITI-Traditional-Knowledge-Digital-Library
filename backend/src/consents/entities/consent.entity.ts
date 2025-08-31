import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from '../../records/entities/record.entity';

@Entity('consents')
export class ConsentEntity extends BaseEntity {
  @ManyToOne(() => RecordEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recordId' })
  record: RecordEntity;

  @Column()
  recordId: string;

  @Column({
    type: 'enum',
    enum: ['PIC', 'MAT'],
  })
  type: 'PIC' | 'MAT';

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  terms?: string;
}