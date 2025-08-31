import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { Roles, Public } from 'nest-keycloak-connect';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { SearchRecordsDto } from './dto/search-records.dto';
import { AuditService } from '../audit/audit.service';

@Controller('records')
export class RecordsController {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles({ roles: ['community_user', 'examiner', 'admin'] })
  async create(@Body() createRecordDto: CreateRecordDto, @Request() req) {
    const record = await this.recordsService.create(createRecordDto);
    
    await this.auditService.append(
      req.user?.preferred_username || 'system',
      'record.create',
      { recordId: record.id, title: record.title_ht }
    );
    
    return record;
  }

  @Get()
  @Public()
  async findAll(@Query() searchDto: SearchRecordsDto) {
    return await this.recordsService.findAll(searchDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.recordsService.findOne(id);
  }
}