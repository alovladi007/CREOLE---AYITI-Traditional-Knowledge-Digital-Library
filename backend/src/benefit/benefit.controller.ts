import { Controller, Get, Post, Patch, Body, Param, Request } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { BenefitService } from './benefit.service';
import { AuditService } from '../audit/audit.service';

@Controller('benefit')
export class BenefitController {
  constructor(
    private readonly benefitService: BenefitService,
    private readonly auditService: AuditService,
  ) {}

  @Post('contracts')
  @Roles({ roles: ['admin'] })
  async createContract(@Body() body: any, @Request() req) {
    const contract = await this.benefitService.createContract(body);
    
    await this.auditService.append(
      req.user?.preferred_username || 'admin',
      'contract.create',
      { contractId: contract.id, community: contract.community }
    );

    return contract;
  }

  @Get('contracts')
  @Roles({ roles: ['admin'] })
  async getContracts() {
    return await this.benefitService.findAllContracts();
  }

  @Get('contracts/:id')
  @Roles({ roles: ['admin'] })
  async getContract(@Param('id') id: string) {
    return await this.benefitService.findContract(id);
  }

  @Get('contracts/:id/payouts')
  @Roles({ roles: ['admin'] })
  async getPayouts(@Param('id') contractId: string) {
    return await this.benefitService.findPayoutsByContract(contractId);
  }

  @Post('payouts')
  @Roles({ roles: ['admin'] })
  async createPayout(@Body() body: any, @Request() req) {
    const payout = await this.benefitService.createPayout(body);
    
    await this.auditService.append(
      req.user?.preferred_username || 'admin',
      'payout.create',
      { 
        payoutId: payout.id, 
        contractId: payout.contractId,
        amount: payout.amount,
        currency: payout.currency,
      }
    );

    return payout;
  }

  @Patch('payouts/:id/status')
  @Roles({ roles: ['admin'] })
  async updatePayoutStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const payout = await this.benefitService.updatePayoutStatus(
      id,
      body.status,
      body.txref,
    );

    await this.auditService.append(
      req.user?.preferred_username || 'admin',
      'payout.status_update',
      { 
        payoutId: payout.id,
        status: payout.status,
        txref: payout.txref,
      }
    );

    return payout;
  }
}