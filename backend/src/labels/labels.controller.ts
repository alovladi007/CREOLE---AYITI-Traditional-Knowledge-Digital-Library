import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { LabelsService } from './labels.service';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  @Public()
  async findAll() {
    return await this.labelsService.findAll();
  }
}