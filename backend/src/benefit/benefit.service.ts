import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitContractEntity, PayoutEntity } from './benefit.entities';

@Injectable()
export class BenefitService {
  constructor(
    @InjectRepository(BenefitContractEntity) private bcRepo: Repository<BenefitContractEntity>,
    @InjectRepository(PayoutEntity) private payRepo: Repository<PayoutEntity>,
  ) {}

  createContract(data: Partial<BenefitContractEntity>) { 
    return this.bcRepo.save(this.bcRepo.create(data)); 
  }

  listContracts() { 
    return this.bcRepo.find({ order: { createdAt: 'DESC' } }); 
  }

  addPayout(data: Partial<PayoutEntity>) { 
    return this.payRepo.save(this.payRepo.create(data)); 
  }

  listPayouts(contractId: string) { 
    return this.payRepo.find({ where: { contractId }, order: { createdAt: 'DESC' } }); 
  }

  setPayoutStatus(id: string, status: 'pending'|'sent'|'failed', txref?: string) {
    return this.payRepo.update({ id }, { status, txref });
  }
}