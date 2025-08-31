import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { Public } from 'nest-keycloak-connect';

@Controller('v1/records')
export class RecordsController {
  constructor(private readonly service: RecordsService) {}

  @Post()
  create(@Body() dto: CreateRecordDto) {
    return this.service.create(dto);
  }

  @Get()
  @Public()
  findAll(@Query() query: SearchRecordsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}