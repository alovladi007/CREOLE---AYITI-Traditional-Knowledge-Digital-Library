import { Controller, Get } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { ConsentsService } from './consents.service';

@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Get()
  @Roles({ roles: ['examiner', 'admin'] })
  async findAll() {
    return await this.consentsService.findAll();
  }
}