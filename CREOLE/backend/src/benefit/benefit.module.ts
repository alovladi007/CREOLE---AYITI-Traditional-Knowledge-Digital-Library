import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitContractEntity, PayoutEntity } from './benefit.entities';
import { BenefitService } from './benefit.service';
import { BenefitController } from './benefit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BenefitContractEntity, PayoutEntity])],
  providers: [BenefitService],
  controllers: [BenefitController],
})
export class BenefitModule {}