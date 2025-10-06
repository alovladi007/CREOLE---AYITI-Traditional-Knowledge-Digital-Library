import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from '../records/entities/record.entity';

@Injectable()
export class CitationService {
  constructor(
    @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
  ) {}

  async generateCitation(recordId: string, format: 'apa' | 'mla' | 'chicago' | 'harvard' | 'bibtex'): Promise<string> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) throw new Error('Record not found');

    switch (format) {
      case 'apa':
        return this.generateAPA(record);
      case 'mla':
        return this.generateMLA(record);
      case 'chicago':
        return this.generateChicago(record);
      case 'harvard':
        return this.generateHarvard(record);
      case 'bibtex':
        return this.generateBibTeX(record);
      default:
        return this.generateAPA(record);
    }
  }

  private generateAPA(record: RecordEntity): string {
    const year = record.createdAt.getFullYear();
    const community = record.community || 'Unknown Community';
    const title = record.title_ht;

    return `${community}. (${year}). ${title}. CREOLE Traditional Knowledge Digital Library. Retrieved from https://creole-tkdl.org/records/${record.id}`;
  }

  private generateMLA(record: RecordEntity): string {
    const community = record.community || 'Unknown Community';
    const title = record.title_ht;
    const year = record.createdAt.getFullYear();

    return `${community}. "${title}." CREOLE Traditional Knowledge Digital Library, ${year}, creole-tkdl.org/records/${record.id}.`;
  }

  private generateChicago(record: RecordEntity): string {
    const community = record.community || 'Unknown Community';
    const title = record.title_ht;
    const year = record.createdAt.getFullYear();

    return `${community}. "${title}." CREOLE Traditional Knowledge Digital Library. ${year}. https://creole-tkdl.org/records/${record.id}.`;
  }

  private generateHarvard(record: RecordEntity): string {
    const community = record.community || 'Unknown Community';
    const title = record.title_ht;
    const year = record.createdAt.getFullYear();

    return `${community} (${year}) ${title}. Available at: https://creole-tkdl.org/records/${record.id} (Accessed: ${new Date().toLocaleDateString()}).`;
  }

  private generateBibTeX(record: RecordEntity): string {
    const year = record.createdAt.getFullYear();
    const citeKey = `${record.community || 'CREOLE'}_${year}_${record.id.substring(0, 8)}`;
    const title = record.title_ht;
    const community = record.community || 'Unknown Community';

    let bibtex = `@misc{${citeKey},\n`;
    bibtex += `  title = {${title}},\n`;
    if (record.title_fr) bibtex += `  subtitle = {${record.title_fr}},\n`;
    if (record.abstract_en) bibtex += `  abstract = {${record.abstract_en}},\n`;
    bibtex += `  author = {${community}},\n`;
    bibtex += `  year = {${year}},\n`;
    bibtex += `  howpublished = {CREOLE Traditional Knowledge Digital Library},\n`;
    bibtex += `  note = {Traditional Knowledge Record, Classification: ${record.creole_class}},\n`;
    bibtex += `  url = {https://creole-tkdl.org/records/${record.id}}\n`;
    bibtex += `}`;

    return bibtex;
  }

  async generateMultipleCitations(recordIds: string[], format: string): Promise<string[]> {
    const citations: string[] = [];

    for (const recordId of recordIds) {
      try {
        const citation = await this.generateCitation(recordId, format as any);
        citations.push(citation);
      } catch (error) {
        citations.push(`Error generating citation for ${recordId}: ${error.message}`);
      }
    }

    return citations;
  }

  async generateBibliography(recordIds: string[], format: string = 'apa'): Promise<string> {
    const citations = await this.generateMultipleCitations(recordIds, format);
    return citations.join('\n\n');
  }
}
