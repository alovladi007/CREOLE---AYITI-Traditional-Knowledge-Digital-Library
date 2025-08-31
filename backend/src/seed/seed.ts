import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LabelsService } from '../labels/labels.service';
import { RecordsService } from '../records/records.service';
import seedData from './data/seed-records.json';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const labelsService = app.get(LabelsService);
  const recordsService = app.get(RecordsService);

  console.log('Seeding TK Labels...');
  
  const labels = [
    { code: 'TK_Attribution', description: 'This label should be used when a community has an attribution interest.' },
    { code: 'TK_NonCommercial', description: 'This label should be used when a community has restrictions on commercial use.' },
    { code: 'TK_NoDerivatives', description: 'This label should be used when a community wants to prevent derivative works.' },
    { code: 'TK_CulturallySensitive', description: 'This label indicates culturally sensitive traditional knowledge.' },
    { code: 'TK_Secret', description: 'This label indicates secret/sacred traditional knowledge.' },
  ];

  for (const label of labels) {
    const existing = await labelsService.findByCode(label.code);
    if (!existing) {
      await labelsService.create(label.code, label.description);
      console.log(`Created label: ${label.code}`);
    }
  }

  console.log('Seeding example records...');
  
  for (const record of seedData.records) {
    await recordsService.create(record as any);
    console.log(`Created record: ${record.title_ht}`);
  }

  console.log('Seeding completed successfully!');
  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});