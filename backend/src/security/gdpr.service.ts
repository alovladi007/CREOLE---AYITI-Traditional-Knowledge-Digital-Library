import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '../users/user-profile.entity';
import { AnalyticsEventEntity } from '../analytics/analytics.entity';
import { RecordCommentEntity } from '../records/entities/record-comment.entity';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(UserProfileEntity) private profileRepo: Repository<UserProfileEntity>,
    @InjectRepository(AnalyticsEventEntity) private analyticsRepo: Repository<AnalyticsEventEntity>,
    @InjectRepository(RecordCommentEntity) private commentRepo: Repository<RecordCommentEntity>,
  ) {}

  // Right to access: Export all user data
  async exportUserData(userId: string): Promise<any> {
    const profile = await this.profileRepo.findOne({ where: { keycloak_user_id: userId } });
    const analytics = await this.analyticsRepo.find({ where: { user_id: userId } });
    const comments = await this.commentRepo.find({ where: { user_id: userId } });

    return {
      profile,
      analytics: {
        total_events: analytics.length,
        events: analytics
      },
      comments: {
        total: comments.length,
        data: comments
      },
      export_date: new Date(),
      format: 'JSON'
    };
  }

  // Right to be forgotten: Anonymize or delete user data
  async deleteUserData(userId: string, mode: 'anonymize' | 'delete' = 'anonymize'): Promise<{
    success: boolean;
    deleted: string[];
  }> {
    const deleted: string[] = [];

    if (mode === 'delete') {
      // Permanently delete
      await this.profileRepo.delete({ keycloak_user_id: userId });
      deleted.push('profile');

      await this.analyticsRepo.delete({ user_id: userId });
      deleted.push('analytics');

      await this.commentRepo.delete({ user_id: userId });
      deleted.push('comments');
    } else {
      // Anonymize
      const anonymousId = `anonymous-${Date.now()}`;

      await this.profileRepo.update(
        { keycloak_user_id: userId },
        {
          email: `${anonymousId}@deleted.local`,
          display_name: 'Deleted User',
          bio: null,
          affiliation: null,
          community: null,
          areas_of_expertise: [],
          languages: [],
          is_public: false
        }
      );
      deleted.push('profile (anonymized)');

      await this.analyticsRepo.update(
        { user_id: userId },
        { user_id: anonymousId }
      );
      deleted.push('analytics (anonymized)');

      await this.commentRepo.update(
        { user_id: userId },
        {
          user_id: anonymousId,
          user_name: 'Deleted User'
        }
      );
      deleted.push('comments (anonymized)');
    }

    return {
      success: true,
      deleted
    };
  }

  // Right to rectification: Update user data
  async rectifyUserData(userId: string, updates: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    await this.profileRepo.update({ keycloak_user_id: userId }, updates);
    return this.profileRepo.findOne({ where: { keycloak_user_id: userId } });
  }

  // Data portability: Export in multiple formats
  async exportUserDataInFormat(userId: string, format: 'json' | 'csv' | 'xml'): Promise<string> {
    const data = await this.exportUserData(userId);

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return JSON.stringify(data);
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion (would use a library in production)
    let csv = 'Type,Data\n';
    csv += `Profile,"${JSON.stringify(data.profile)}"\n`;
    csv += `Analytics Count,${data.analytics.total_events}\n`;
    csv += `Comments Count,${data.comments.total}\n`;
    return csv;
  }

  private convertToXML(data: any): string {
    // Simple XML conversion
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<user_data>\n';
    xml += `  <profile>${JSON.stringify(data.profile)}</profile>\n`;
    xml += `  <analytics_count>${data.analytics.total_events}</analytics_count>\n`;
    xml += `  <comments_count>${data.comments.total}</comments_count>\n`;
    xml += '</user_data>';
    return xml;
  }
}
