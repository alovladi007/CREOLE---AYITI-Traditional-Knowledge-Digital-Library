import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from './entities/record.entity';
import { Parser } from 'json2csv';

@Injectable()
export class RecordsBulkService {
  constructor(@InjectRepository(RecordEntity) private repo: Repository<RecordEntity>) {}

  async bulkImportCSV(csvData: string): Promise<{ imported: number; errors: any[] }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const errors = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',');
        const record: any = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            // Handle JSON fields
            if (['ipc_codes', 'tk_labels', 'region', 'metadata'].includes(header)) {
              try {
                record[header] = JSON.parse(values[index]);
              } catch {
                record[header] = values[index].split(';');
              }
            } else {
              record[header] = values[index].trim();
            }
          }
        });

        if (record.title_ht) {
          const entity = this.repo.create(record);
          await this.repo.save(entity);
          imported++;
        }
      } catch (error) {
        errors.push({ line: i + 1, error: error.message });
      }
    }

    return { imported, errors };
  }

  async bulkImportJSON(jsonData: any[]): Promise<{ imported: number; errors: any[] }> {
    const errors = [];
    let imported = 0;

    for (let i = 0; i < jsonData.length; i++) {
      try {
        const entity = this.repo.create(jsonData[i]);
        await this.repo.save(entity);
        imported++;
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    return { imported, errors };
  }

  async exportToCSV(filters: any = {}): Promise<string> {
    const records = await this.repo.find({ where: filters });

    const fields = [
      'id',
      'title_ht',
      'title_fr',
      'abstract_en',
      'creole_class',
      'ipc_codes',
      'tk_labels',
      'access_tier',
      'community',
      'region',
      'status',
      'view_count',
      'createdAt',
      'updatedAt'
    ];

    const parser = new Parser({ fields });
    return parser.parse(records);
  }

  async exportToJSON(filters: any = {}): Promise<any[]> {
    return this.repo.find({ where: filters });
  }

  async exportToBibTeX(filters: any = {}): Promise<string> {
    const records = await this.repo.find({ where: filters });
    let bibtex = '';

    records.forEach(record => {
      const year = record.createdAt.getFullYear();
      const citeKey = `${record.community || 'CREOLE'}_${year}_${record.id.substring(0, 8)}`;

      bibtex += `@misc{${citeKey},\n`;
      bibtex += `  title = {${record.title_ht}},\n`;
      if (record.title_fr) bibtex += `  subtitle = {${record.title_fr}},\n`;
      if (record.abstract_en) bibtex += `  abstract = {${record.abstract_en}},\n`;
      if (record.community) bibtex += `  author = {${record.community}},\n`;
      bibtex += `  year = {${year}},\n`;
      bibtex += `  note = {Traditional Knowledge Record, Classification: ${record.creole_class}},\n`;
      bibtex += `  url = {https://creole-tkdl.org/records/${record.id}}\n`;
      bibtex += `}\n\n`;
    });

    return bibtex;
  }

  async validateRecords(records: any[]): Promise<{ valid: any[]; invalid: any[] }> {
    const valid = [];
    const invalid = [];

    for (const record of records) {
      const errors = [];

      if (!record.title_ht) errors.push('title_ht is required');
      if (!record.creole_class) errors.push('creole_class is required');

      const validClasses = ['C-FOOD', 'C-MED', 'C-RIT', 'C-MUS', 'C-CRAFT', 'C-AGRI', 'C-ORAL', 'C-EDU'];
      if (record.creole_class && !validClasses.includes(record.creole_class)) {
        errors.push(`Invalid creole_class: ${record.creole_class}`);
      }

      const validTiers = ['public', 'restricted', 'secret'];
      if (record.access_tier && !validTiers.includes(record.access_tier)) {
        errors.push(`Invalid access_tier: ${record.access_tier}`);
      }

      if (errors.length > 0) {
        invalid.push({ record, errors });
      } else {
        valid.push(record);
      }
    }

    return { valid, invalid };
  }
}
