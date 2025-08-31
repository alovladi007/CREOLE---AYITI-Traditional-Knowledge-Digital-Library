import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RecordEntity } from '../records/entities/record.entity';

@Entity('benefit_contracts')
export class BenefitContractEntity extends BaseEntity {
  @ManyToOne(() => RecordEntity, { onDelete: 'SET NULL', nullable: true })
  record: RecordEntity | null;

  @Column({ nullable: true }) 
  recordId: string;

  @Column() 
  community: string;

  @Column({ type: 'jsonb' }) 
  terms: any;

  @Column({ nullable: true }) 
  payout_address: string;

  @Column({ default: 'draft' }) 
  status: 'draft'|'active'|'suspended'|'terminated';
}

@Entity('payouts')
export class PayoutEntity extends BaseEntity {
  @ManyToOne(() => BenefitContractEntity, { onDelete: 'CASCADE' })
  contract: BenefitContractEntity;

  @Column() 
  contractId: string;

  @Column('decimal', { precision: 12, scale: 2 }) 
  amount: number;

  @Column({ default: 'USD' }) 
  currency: string;

  @Column({ default: 'pending' }) 
  status: 'pending'|'sent'|'failed';

  @Column({ nullable: true }) 
  txref: string;
}