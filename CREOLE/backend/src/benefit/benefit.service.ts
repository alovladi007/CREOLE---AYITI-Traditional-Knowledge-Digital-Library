import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitContractEntity, PayoutEntity, PayoutStatus } from './benefit.entities';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(BenefitContractEntity)
    private contractRepository: Repository<BenefitContractEntity>,
    @InjectRepository(PayoutEntity)
    private payoutRepository: Repository<PayoutEntity>,
  ) {}

  async createContract(data: Partial<BenefitContractEntity>): Promise<BenefitContractEntity> {
    const contract = this.contractRepository.create(data);
    return await this.contractRepository.save(contract);
  }

  async findAllContracts(): Promise<BenefitContractEntity[]> {
    return await this.contractRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findContract(id: string): Promise<BenefitContractEntity> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    return contract;
  }

  async createPayout(data: {
    contractId: string;
    amount: number;
    currency?: string;
  }): Promise<PayoutEntity> {
    const contract = await this.findContract(data.contractId);
    
    const payout = this.payoutRepository.create({
      contractId: contract.id,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'pending',
    });

    return await this.payoutRepository.save(payout);
  }

  async findPayoutsByContract(contractId: string): Promise<PayoutEntity[]> {
    return await this.payoutRepository.find({
      where: { contractId },
      order: { createdAt: 'DESC' },
    });
  }

  async updatePayoutStatus(
    id: string,
    status: PayoutStatus,
    txref?: string,
  ): Promise<PayoutEntity> {
    const payout = await this.payoutRepository.findOne({ where: { id } });
    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }

    payout.status = status;
    if (txref) {
      payout.txref = txref;
    }

    return await this.payoutRepository.save(payout);
  }
}