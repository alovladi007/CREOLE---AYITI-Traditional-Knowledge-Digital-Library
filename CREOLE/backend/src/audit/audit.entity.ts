import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('audit_logs')
export class AuditLogEntity extends BaseEntity {
  @Column() 
  actor: string;

  @Column() 
  action: string;

  @Column({ type: 'jsonb', nullable: true }) 
  details: any;

  @Column({ nullable: true }) 
  prev_hash: string;

  @Column() 
  hash: string;
}