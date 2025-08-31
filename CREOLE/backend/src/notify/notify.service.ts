import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class NotifyService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
      });
    }
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      console.log(`[EMAIL STUB] To: ${to}, Subject: ${subject}, Text: ${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'CREOLE <no-reply@creole.local>',
        to,
        subject,
        text,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendWebhook(event: string, data: any): Promise<void> {
    if (!process.env.WEBHOOK_URL) {
      console.log(`[WEBHOOK STUB] Event: ${event}, Data:`, JSON.stringify(data));
      return;
    }

    try {
      await axios.post(process.env.WEBHOOK_URL, {
        event,
        timestamp: new Date().toISOString(),
        data,
      });
      console.log(`Webhook sent: ${event}`);
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }
}