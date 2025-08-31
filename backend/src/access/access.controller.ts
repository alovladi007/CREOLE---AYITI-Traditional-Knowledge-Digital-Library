import { Body, Controller, Get, Param, Patch, Post, Req, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from '../records/entities/record.entity';
import { NotifyService } from '../notify/notify.service';
import { AuditService } from '../audit/audit.service';
import { Roles } from 'nest-keycloak-connect';
import { AccessService } from './access.service';
import { CreateAccessRequestDto } from './dto';

@Controller('v1/access-requests')
export class AccessController {
  constructor(
    private readonly service: AccessService,
    @InjectRepository(RecordEntity) private recRepo: Repository<RecordEntity>,
    private readonly notify: NotifyService,
    private readonly audit: AuditService,
  ) {}

  @Post()
  async create(@Body() dto: CreateAccessRequestDto, @Req() req: any) {
    const requester = req?.user?.preferred_username || req?.user?.email || 'unknown';
    if (!dto.recordId) throw new BadRequestException('recordId is required');
    const rec = await this.recRepo.findOne({ where: { id: dto.recordId } });
    if (!rec) throw new BadRequestException('record not found');
    if (rec.access_tier === 'public') throw new BadRequestException('Access request only for restricted/secret records');
    
    const created = await this.service.create({ 
      requester, 
      purpose: dto.purpose, 
      requested_fields: dto.requested_fields || null, 
      recordId: dto.recordId 
    });
    
    await this.notify.webhook({ type: 'access_request.created', id: created.id, recordId: dto.recordId, requester });
    const admin = process.env.ADMIN_EMAIL || 'admin@example.com';
    await this.notify.sendEmail(admin, 'CREOLE access request', `Request ${created.id} for record ${dto.recordId} by ${requester}`);
    await this.audit.append(requester, 'access_request.created', { id: created.id, recordId: dto.recordId });
    
    return created;
  }

  @Get('inbox')
  @Roles({ roles: ['admin'] })
  inbox() {
    return this.service.listInbox();
  }

  @Patch(':id/approve')
  @Roles({ roles: ['admin'] })
  async approve(@Param('id') id: string, @Req() req: any, @Body('note') note?: string) {
    const decidedBy = req?.user?.preferred_username || 'admin';
    const res = await this.service.decide(id, 'approved', decidedBy, note);
    await this.notify.webhook({ type: 'access_request.approved', id });
    await this.audit.append(decidedBy, 'access_request.approved', { id });
    const admin = process.env.ADMIN_EMAIL || 'admin@example.com';
    await this.notify.sendEmail(admin, 'CREOLE access APPROVED', `Request ${id} approved by ${decidedBy}`);
    return res;
  }

  @Patch(':id/deny')
  @Roles({ roles: ['admin'] })
  async deny(@Param('id') id: string, @Req() req: any, @Body('note') note?: string) {
    const decidedBy = req?.user?.preferred_username || 'admin';
    const res = await this.service.decide(id, 'denied', decidedBy, note);
    await this.notify.webhook({ type: 'access_request.denied', id });
    await this.audit.append(decidedBy, 'access_request.denied', { id });
    const admin = process.env.ADMIN_EMAIL || 'admin@example.com';
    await this.notify.sendEmail(admin, 'CREOLE access DENIED', `Request ${id} denied by ${decidedBy}`);
    return res;
  }
}