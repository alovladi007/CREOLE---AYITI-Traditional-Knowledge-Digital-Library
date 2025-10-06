import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { RecordsBulkService } from '../records/records-bulk.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportRequestEntity } from '../export/export-request.entity';

@Processor('export')
@Injectable()
export class ExportProcessor {
  constructor(
    private bulkService: RecordsBulkService,
    @InjectRepository(ExportRequestEntity) private exportRepo: Repository<ExportRequestEntity>,
  ) {}

  @Process('generate-export')
  async handleExport(job: Job) {
    const { exportId, filters, format } = job.data;

    try {
      await this.exportRepo.update(exportId, { status: 'processing' });

      let fileContent: string;
      let mimeType: string;

      switch (format) {
        case 'csv':
          fileContent = await this.bulkService.exportToCSV(filters);
          mimeType = 'text/csv';
          break;
        case 'json':
          fileContent = JSON.stringify(await this.bulkService.exportToJSON(filters), null, 2);
          mimeType = 'application/json';
          break;
        case 'bibtex':
          fileContent = await this.bulkService.exportToBibTeX(filters);
          mimeType = 'text/plain';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // In a real implementation, upload to MinIO or S3
      const fileUrl = `/exports/${exportId}.${format}`;
      const fileSize = Buffer.byteLength(fileContent);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

      await this.exportRepo.update(exportId, {
        status: 'completed',
        file_url: fileUrl,
        file_size: fileSize,
        completed_at: new Date(),
        expires_at: expiresAt
      });

      return { success: true, fileUrl };
    } catch (error) {
      await this.exportRepo.update(exportId, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }
}
