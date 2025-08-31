import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { BenefitService } from './benefit.service';

@Controller('v1/benefit')
@Roles({ roles: ['admin'] })
export class BenefitController {
  constructor(private readonly svc: BenefitService) {}

  @Post('contracts')
  createContract(@Body() body: any){ 
    return this.svc.createContract(body); 
  }

  @Get('contracts')
  listContracts(){ 
    return this.svc.listContracts(); 
  }

  @Post('payouts')
  addPayout(@Body() body: any){ 
    return this.svc.addPayout(body); 
  }

  @Get('contracts/:id/payouts')
  listPayouts(@Param('id') id: string){ 
    return this.svc.listPayouts(id); 
  }

  @Patch('payouts/:id/status')
  setStatus(@Param('id') id: string, @Body() body: any){ 
    return this.svc.setPayoutStatus(id, body.status, body.txref); 
  }
}