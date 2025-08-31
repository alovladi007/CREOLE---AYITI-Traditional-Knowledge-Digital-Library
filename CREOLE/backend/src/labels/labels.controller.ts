import { Controller, Get } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { Public } from 'nest-keycloak-connect';

@Controller('v1/labels')
export class LabelsController {
  constructor(private readonly service: LabelsService) {}
  
  @Get()
  @Public()
  list() { 
    return this.service.list(); 
  }
}