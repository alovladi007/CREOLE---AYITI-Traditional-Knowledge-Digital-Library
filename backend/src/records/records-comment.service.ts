import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordCommentEntity } from './entities/record-comment.entity';

@Injectable()
export class RecordsCommentService {
  constructor(
    @InjectRepository(RecordCommentEntity) private repo: Repository<RecordCommentEntity>,
  ) {}

  async create(data: {
    record_id: string;
    user_id: string;
    user_name: string;
    content: string;
    parent_comment_id?: string;
  }): Promise<RecordCommentEntity> {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  async getCommentsByRecord(recordId: string, includeRejected = false): Promise<RecordCommentEntity[]> {
    const query = this.repo.createQueryBuilder('comment')
      .where('comment.record_id = :recordId', { recordId })
      .orderBy('comment.createdAt', 'DESC');

    if (!includeRejected) {
      query.andWhere('comment.status != :status', { status: 'rejected' });
    }

    return query.getMany();
  }

  async getComment(id: string): Promise<RecordCommentEntity> {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'flagged'
  ): Promise<RecordCommentEntity> {
    await this.repo.update(id, { status });
    return this.getComment(id);
  }

  async upvote(id: string): Promise<RecordCommentEntity> {
    const comment = await this.getComment(id);
    await this.repo.update(id, { upvotes: comment.upvotes + 1 });
    return this.getComment(id);
  }

  async downvote(id: string): Promise<RecordCommentEntity> {
    const comment = await this.getComment(id);
    await this.repo.update(id, { downvotes: comment.downvotes + 1 });
    return this.getComment(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getPendingComments(): Promise<RecordCommentEntity[]> {
    return this.repo.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' }
    });
  }
}
