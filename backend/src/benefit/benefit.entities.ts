import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

export type ContractStatus = 'draft' | 'active' | 'suspended' | 'terminated';
export type PayoutStatus = 'pending' | 'sent' | 'failed';

@Entity('benefit_contracts')
export class BenefitContractEntity extends BaseEntity {
  @Column({ nullable: true })
  recordId?: string;

  @Column()
  community: string;

  @Column('jsonb')
  terms: Record<string, any>;

  @Column({ nullable: true })
  payout_address?: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'suspended', 'terminated'],
    default: 'draft',
  })
  status: ContractStatus;
}

@Entity('payouts')
export class PayoutEntity extends BaseEntity {
  @ManyToOne(() => BenefitContractEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: BenefitContractEntity;

  @Column()
  contractId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  })
  status: PayoutStatus;

  @Column({ nullable: true })
  txref?: string;
}