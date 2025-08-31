import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('labels')
export class LabelEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description?: string;
}