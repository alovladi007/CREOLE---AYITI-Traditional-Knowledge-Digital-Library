import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('labels')
export class LabelEntity extends BaseEntity {
  @Column({ unique: true })
  code: string; // e.g., TK_NonCommercial

  @Column({ nullable: true })
  description: string;
}