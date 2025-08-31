import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitContractEntity, PayoutEntity } from './benefit.entities';
import { BenefitService } from './benefit.service';
import { BenefitController } from './benefit.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BenefitContractEntity, PayoutEntity]),
    AuditModule,
  ],
  providers: [BenefitService],
  controllers: [BenefitController],
  exports: [BenefitService],
})
export class BenefitModule {}