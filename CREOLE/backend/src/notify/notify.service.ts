import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotifyService {
  private transporter: nodemailer.Transporter | null = null;
  private webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL || undefined;
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: { user, pass }
      });
    }
  }

  async sendEmail(to: string, subject: string, text: string) {
    if (!this.transporter) { 
      console.log('[email stub]', to, subject); 
      return; 
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'CREOLE <no-reply@creole.local>',
      to,
      subject,
      text
    });
  }

  async webhook(payload: any) {
    if (!this.webhookUrl) { 
      console.log('[webhook stub]', payload); 
      return; 
    }
    await fetch(this.webhookUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
  }
}