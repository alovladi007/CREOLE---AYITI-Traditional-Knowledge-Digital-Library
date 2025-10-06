import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordEntity } from './entities/record.entity';
import { RecordVersionEntity } from './entities/record-version.entity';

@Injectable()
export class RecordsVersionService {
  constructor(
    @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
    @InjectRepository(RecordVersionEntity) private versionRepo: Repository<RecordVersionEntity>,
  ) {}

  async createVersion(
    recordId: string,
    userId: string,
    changeReason?: string
  ): Promise<RecordVersionEntity> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) throw new Error('Record not found');

    // Get previous version for diff calculation
    const previousVersion = await this.versionRepo.findOne({
      where: { record_id: recordId },
      order: { version_number: 'DESC' }
    });

    const versionNumber = previousVersion ? previousVersion.version_number + 1 : 1;
    const changes = previousVersion ? this.calculateDiff(previousVersion.snapshot, record) : null;

    const version = this.versionRepo.create({
      record_id: recordId,
      version_number: versionNumber,
      snapshot: { ...record },
      changes,
      changed_by: userId,
      change_reason: changeReason
    });

    // Update record version number
    await this.recordRepo.update(recordId, { version: versionNumber });

    return this.versionRepo.save(version);
  }

  async getVersionHistory(recordId: string): Promise<RecordVersionEntity[]> {
    return this.versionRepo.find({
      where: { record_id: recordId },
      order: { version_number: 'DESC' }
    });
  }

  async getVersion(recordId: string, versionNumber: number): Promise<RecordVersionEntity> {
    return this.versionRepo.findOne({
      where: { record_id: recordId, version_number: versionNumber }
    });
  }

  async revertToVersion(
    recordId: string,
    versionNumber: number,
    userId: string
  ): Promise<RecordEntity> {
    const version = await this.getVersion(recordId, versionNumber);
    if (!version) throw new Error('Version not found');

    const snapshot = version.snapshot;
    delete snapshot.id;
    delete snapshot.createdAt;
    delete snapshot.updatedAt;

    await this.recordRepo.update(recordId, snapshot);

    // Create new version entry for the revert
    await this.createVersion(recordId, userId, `Reverted to version ${versionNumber}`);

    return this.recordRepo.findOne({ where: { id: recordId } });
  }

  private calculateDiff(oldData: any, newData: any): any {
    const changes: any = {};

    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }

    return changes;
  }

  async compareVersions(
    recordId: string,
    version1: number,
    version2: number
  ): Promise<any> {
    const v1 = await this.getVersion(recordId, version1);
    const v2 = await this.getVersion(recordId, version2);

    if (!v1 || !v2) throw new Error('Version not found');

    return {
      version1: v1.version_number,
      version2: v2.version_number,
      diff: this.calculateDiff(v1.snapshot, v2.snapshot)
    };
  }
}
