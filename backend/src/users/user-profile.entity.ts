import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('user_profiles')
export class UserProfileEntity extends BaseEntity {
  @Column({ unique: true })
  @Index()
  keycloak_user_id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  display_name: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  affiliation: string;

  @Column({ nullable: true })
  community: string;

  @Column({ type: 'jsonb', default: [] })
  areas_of_expertise: string[];

  @Column({ type: 'jsonb', default: [] })
  languages: string[];

  @Column({ type: 'int', default: 0 })
  contribution_count: number;

  @Column({ type: 'int', default: 0 })
  reputation_score: number;

  @Column({ default: true })
  is_public: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @Column({ type: 'timestamp', nullable: true })
  last_active: Date;
}
