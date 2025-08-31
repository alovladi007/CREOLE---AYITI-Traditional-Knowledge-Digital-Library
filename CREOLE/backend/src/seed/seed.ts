import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { config as dotenv } from 'dotenv';
import { RecordEntity } from '../records/entities/record.entity';
import { LabelEntity } from '../labels/entities/label.entity';
import { ConsentEntity } from '../consents/entities/consent.entity';
import { AccessRequestEntity } from '../access/access-request.entity';
import { MediaEntity } from '../media/media.entity';
import { AuditLogEntity } from '../audit/audit.entity';
import { BenefitContractEntity, PayoutEntity } from '../benefit/benefit.entities';

dotenv();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'creole',
  password: process.env.POSTGRES_PASSWORD || 'creolepass',
  database: process.env.POSTGRES_DB || 'creole',
  entities: [RecordEntity, LabelEntity, ConsentEntity, AccessRequestEntity, MediaEntity, AuditLogEntity, BenefitContractEntity, PayoutEntity],
  synchronize: true,
});

async function run() {
  await AppDataSource.initialize();
  const recordRepo = AppDataSource.getRepository(RecordEntity);
  const labelRepo = AppDataSource.getRepository(LabelEntity);

  const labels = [
    { code: 'TK_Attribution', description: 'Use requires attribution to community/holders.' },
    { code: 'TK_NonCommercial', description: 'Use for non-commercial purposes only.' },
  ];
  for (const l of labels) {
    const exists = await labelRepo.findOne({ where: { code: l.code } });
    if (!exists) await labelRepo.save(labelRepo.create(l));
  }

  const seedPath = path.join(__dirname, 'data', 'seed-records.json');
  const json = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  for (const r of json) {
    const exists = await recordRepo.findOne({ where: { title_ht: r.title_ht, creole_class: r.creole_class } });
    if (!exists) await recordRepo.save(recordRepo.create(r));
  }
  console.log('Seed complete.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });