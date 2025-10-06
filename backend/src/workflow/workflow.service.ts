import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewAssignmentEntity } from './review-assignment.entity';
import { RecordEntity } from '../records/entities/record.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(ReviewAssignmentEntity) private reviewRepo: Repository<ReviewAssignmentEntity>,
    @InjectRepository(RecordEntity) private recordRepo: Repository<RecordEntity>,
  ) {}

  async submitForReview(recordId: string, userId: string): Promise<RecordEntity> {
    // Update record status to pending_review
    await this.recordRepo.update(recordId, { status: 'pending_review' });

    return this.recordRepo.findOne({ where: { id: recordId } });
  }

  async assignReviewer(
    recordId: string,
    reviewerId: string,
    reviewerName: string,
    assignedBy: string,
    dueDate?: Date
  ): Promise<ReviewAssignmentEntity> {
    // Check if already assigned
    const existing = await this.reviewRepo.findOne({
      where: { record_id: recordId, reviewer_id: reviewerId, status: 'pending' }
    });

    if (existing) {
      return existing;
    }

    const assignment = this.reviewRepo.create({
      record_id: recordId,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      assigned_by: assignedBy,
      due_date: dueDate,
      checklist: this.getDefaultChecklist()
    });

    return this.reviewRepo.save(assignment);
  }

  async submitReview(
    assignmentId: string,
    status: 'approved' | 'rejected' | 'revision_requested',
    notes: string,
    qualityScore?: number,
    checklist?: any[]
  ): Promise<ReviewAssignmentEntity> {
    const assignment = await this.reviewRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new Error('Assignment not found');

    await this.reviewRepo.update(assignmentId, {
      status,
      review_notes: notes,
      quality_score: qualityScore,
      checklist: checklist || assignment.checklist,
      reviewed_at: new Date()
    });

    // Update record status based on review outcome
    if (status === 'approved') {
      await this.recordRepo.update(assignment.record_id, { status: 'published' });
    } else if (status === 'revision_requested') {
      await this.recordRepo.update(assignment.record_id, { status: 'draft' });
    } else if (status === 'rejected') {
      await this.recordRepo.update(assignment.record_id, { status: 'archived' });
    }

    return this.reviewRepo.findOne({ where: { id: assignmentId } });
  }

  async getMyReviewAssignments(reviewerId: string, status?: string): Promise<ReviewAssignmentEntity[]> {
    const where: any = { reviewer_id: reviewerId };
    if (status) where.status = status;

    return this.reviewRepo.find({
      where,
      relations: ['record'],
      order: { due_date: 'ASC' }
    });
  }

  async getRecordReviews(recordId: string): Promise<ReviewAssignmentEntity[]> {
    return this.reviewRepo.find({
      where: { record_id: recordId },
      order: { createdAt: 'DESC' }
    });
  }

  async reassignReview(assignmentId: string, newReviewerId: string, newReviewerName: string): Promise<ReviewAssignmentEntity> {
    await this.reviewRepo.update(assignmentId, {
      reviewer_id: newReviewerId,
      reviewer_name: newReviewerName,
      status: 'pending'
    });

    return this.reviewRepo.findOne({ where: { id: assignmentId } });
  }

  async getPendingReviews(): Promise<ReviewAssignmentEntity[]> {
    return this.reviewRepo.find({
      where: { status: 'pending' },
      relations: ['record'],
      order: { due_date: 'ASC' }
    });
  }

  async getOverdueReviews(): Promise<ReviewAssignmentEntity[]> {
    const now = new Date();

    return this.reviewRepo
      .createQueryBuilder('assignment')
      .where('assignment.status = :status', { status: 'pending' })
      .andWhere('assignment.due_date < :now', { now })
      .orderBy('assignment.due_date', 'ASC')
      .getMany();
  }

  private getDefaultChecklist() {
    return [
      { item: 'Content is accurate and verifiable', checked: false },
      { item: 'Proper classification applied', checked: false },
      { item: 'TK labels are appropriate', checked: false },
      { item: 'Access tier is correctly assigned', checked: false },
      { item: 'No sensitive information exposed', checked: false },
      { item: 'Metadata is complete', checked: false },
      { item: 'Community consent obtained', checked: false }
    ];
  }
}
