import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordVoteEntity } from './entities/record-vote.entity';

@Injectable()
export class RecordsVoteService {
  constructor(
    @InjectRepository(RecordVoteEntity) private repo: Repository<RecordVoteEntity>,
  ) {}

  async vote(data: {
    record_id: string;
    user_id: string;
    vote_type: 'verify' | 'accurate' | 'helpful' | 'flag';
    comment?: string;
  }): Promise<RecordVoteEntity> {
    // Check if user already voted
    const existing = await this.repo.findOne({
      where: {
        record_id: data.record_id,
        user_id: data.user_id
      }
    });

    if (existing) {
      // Update existing vote
      await this.repo.update(existing.id, {
        vote_type: data.vote_type,
        comment: data.comment
      });
      return this.repo.findOne({ where: { id: existing.id } });
    }

    const vote = this.repo.create(data);
    return this.repo.save(vote);
  }

  async getVotesByRecord(recordId: string): Promise<{
    verify: number;
    accurate: number;
    helpful: number;
    flag: number;
  }> {
    const votes = await this.repo
      .createQueryBuilder('vote')
      .select('vote.vote_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('vote.record_id = :recordId', { recordId })
      .groupBy('vote.vote_type')
      .getRawMany();

    const result = { verify: 0, accurate: 0, helpful: 0, flag: 0 };
    votes.forEach(v => {
      result[v.type] = parseInt(v.count);
    });

    return result;
  }

  async getUserVote(recordId: string, userId: string): Promise<RecordVoteEntity | null> {
    return this.repo.findOne({
      where: { record_id: recordId, user_id: userId }
    });
  }

  async deleteVote(recordId: string, userId: string): Promise<void> {
    await this.repo.delete({ record_id: recordId, user_id: userId });
  }
}
