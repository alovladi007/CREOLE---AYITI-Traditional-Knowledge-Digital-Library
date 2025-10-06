import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_comments')
export class RecordCommentEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column()
  user_id: string;

  @Column()
  user_name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parent_comment_id: string;

  @ManyToOne(() => RecordCommentEntity, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment: RecordCommentEntity;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'flagged';

  @Column({ type: 'int', default: 0 })
  upvotes: number;

  @Column({ type: 'int', default: 0 })
  downvotes: number;
}
