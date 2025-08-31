import { Controller, Get } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('v1/consents')
export class ConsentsController {
  constructor(private readonly service: ConsentsService) {}
  
  @Get() 
  @Roles({ roles: ['admin', 'examiner'] })
  list() { 
    return this.service.findAll(); 
  }
}