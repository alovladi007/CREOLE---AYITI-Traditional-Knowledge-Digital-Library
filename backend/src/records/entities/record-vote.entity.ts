import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { RecordEntity } from './record.entity';

@Entity('record_votes')
@Unique(['record_id', 'user_id'])
export class RecordVoteEntity extends BaseEntity {
  @Column()
  @Index()
  record_id: string;

  @ManyToOne(() => RecordEntity)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column()
  @Index()
  user_id: string;

  @Column()
  vote_type: 'verify' | 'accurate' | 'helpful' | 'flag';

  @Column({ type: 'text', nullable: true })
  comment: string;
}
