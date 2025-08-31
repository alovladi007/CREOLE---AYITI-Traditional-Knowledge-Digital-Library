import { Controller, Get, Post, Patch, Body, Param, Request, BadRequestException } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { AccessService } from './access.service';
import { AuditService } from '../audit/audit.service';
import { NotifyService } from '../notify/notify.service';

@Controller('access-requests')
export class AccessController {
  constructor(
    private readonly accessService: AccessService,
    private readonly auditService: AuditService,
    private readonly notifyService: NotifyService,
  ) {}

  @Post()
  @Roles({ roles: ['community_user', 'examiner', 'admin'] })
  async create(@Body() body: any, @Request() req) {
    if (!body.recordId) {
      throw new BadRequestException('recordId is required');
    }

    const request = await this.accessService.createRequest({
      recordId: body.recordId,
      requester: req.user?.preferred_username || req.user?.email || 'unknown',
      purpose: body.purpose || 'Research purposes',
      requested_fields: body.requested_fields,
    });

    // Send notifications
    await this.notifyService.sendWebhook('access_request.created', {
      requestId: request.id,
      recordId: request.recordId,
      requester: request.requester,
    });

    await this.notifyService.sendEmail(
      process.env.ADMIN_EMAIL || 'admin@example.com',
      'New Access Request',
      `A new access request has been submitted by ${request.requester} for record ${request.recordId}.`,
    );

    // Audit log
    await this.auditService.append(
      request.requester,
      'access_request.create',
      { requestId: request.id, recordId: request.recordId }
    );

    return request;
  }

  @Get('inbox')
  @Roles({ roles: ['admin'] })
  async getInbox() {
    return await this.accessService.findPending();
  }

  @Patch(':id/approve')
  @Roles({ roles: ['admin'] })
  async approve(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const request = await this.accessService.updateStatus(
      id,
      'approved',
      req.user?.preferred_username || 'admin',
      body.note,
    );

    // Notifications
    await this.notifyService.sendWebhook('access_request.approved', {
      requestId: request.id,
      decidedBy: request.decided_by,
    });

    await this.notifyService.sendEmail(
      request.requester,
      'Access Request Approved',
      `Your access request for record ${request.recordId} has been approved.`,
    );

    // Audit
    await this.auditService.append(
      request.decided_by,
      'access_request.approve',
      { requestId: request.id }
    );

    return request;
  }

  @Patch(':id/deny')
  @Roles({ roles: ['admin'] })
  async deny(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    const request = await this.accessService.updateStatus(
      id,
      'denied',
      req.user?.preferred_username || 'admin',
      body.note,
    );

    // Notifications
    await this.notifyService.sendWebhook('access_request.denied', {
      requestId: request.id,
      decidedBy: request.decided_by,
    });

    await this.notifyService.sendEmail(
      request.requester,
      'Access Request Denied',
      `Your access request for record ${request.recordId} has been denied. Reason: ${body.note || 'No reason provided'}`,
    );

    // Audit
    await this.auditService.append(
      request.decided_by,
      'access_request.deny',
      { requestId: request.id, reason: body.note }
    );

    return request;
  }
}