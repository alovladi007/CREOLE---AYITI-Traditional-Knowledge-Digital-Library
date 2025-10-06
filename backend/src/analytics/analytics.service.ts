import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEventEntity } from './analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEventEntity) private repo: Repository<AnalyticsEventEntity>,
  ) {}

  async trackEvent(data: {
    event_type: 'view' | 'search' | 'download' | 'access_request' | 'share' | 'export';
    record_id?: string;
    user_id?: string;
    session_id?: string;
    metadata?: any;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
  }): Promise<AnalyticsEventEntity> {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }

  async getDashboardStats(startDate?: Date, endDate?: Date): Promise<any> {
    const dateFilter = startDate && endDate
      ? { timestamp: Between(startDate, endDate) }
      : {};

    // Total events by type
    const eventsByType = await this.repo
      .createQueryBuilder('event')
      .select('event.event_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter)
      .groupBy('event.event_type')
      .getRawMany();

    // Most viewed records
    const topRecords = await this.repo
      .createQueryBuilder('event')
      .select('event.record_id', 'record_id')
      .addSelect('COUNT(*)', 'view_count')
      .where('event.event_type = :type', { type: 'view' })
      .andWhere('event.record_id IS NOT NULL')
      .andWhere(dateFilter)
      .groupBy('event.record_id')
      .orderBy('view_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top search terms
    const topSearches = await this.repo
      .createQueryBuilder('event')
      .select("event.metadata->>'query'", 'search_term')
      .addSelect('COUNT(*)', 'count')
      .where('event.event_type = :type', { type: 'search' })
      .andWhere("event.metadata->>'query' IS NOT NULL")
      .andWhere(dateFilter)
      .groupBy("event.metadata->>'query'")
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    // Daily activity
    const dailyActivity = await this.repo
      .createQueryBuilder('event')
      .select("DATE_TRUNC('day', event.timestamp)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter)
      .groupBy("DATE_TRUNC('day', event.timestamp)")
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    // Unique users
    const uniqueUsers = await this.repo
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.user_id IS NOT NULL')
      .andWhere(dateFilter)
      .getRawOne();

    return {
      eventsByType,
      topRecords,
      topSearches,
      dailyActivity,
      uniqueUsers: parseInt(uniqueUsers.count),
    };
  }

  async getRecordAnalytics(recordId: string, days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await this.repo.count({
      where: {
        record_id: recordId,
        event_type: 'view',
        timestamp: Between(startDate, new Date())
      }
    });

    const downloads = await this.repo.count({
      where: {
        record_id: recordId,
        event_type: 'download',
        timestamp: Between(startDate, new Date())
      }
    });

    const dailyViews = await this.repo
      .createQueryBuilder('event')
      .select("DATE_TRUNC('day', event.timestamp)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('event.record_id = :recordId', { recordId })
      .andWhere('event.event_type = :type', { type: 'view' })
      .andWhere('event.timestamp >= :startDate', { startDate })
      .groupBy("DATE_TRUNC('day', event.timestamp)")
      .orderBy('date', 'DESC')
      .getRawMany();

    const uniqueViewers = await this.repo
      .createQueryBuilder('event')
      .select('COUNT(DISTINCT event.user_id)', 'count')
      .where('event.record_id = :recordId', { recordId })
      .andWhere('event.event_type = :type', { type: 'view' })
      .andWhere('event.user_id IS NOT NULL')
      .andWhere('event.timestamp >= :startDate', { startDate })
      .getRawOne();

    return {
      views,
      downloads,
      dailyViews,
      uniqueViewers: parseInt(uniqueViewers.count)
    };
  }

  async getUserAnalytics(userId: string, days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activity = await this.repo
      .createQueryBuilder('event')
      .select('event.event_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('event.user_id = :userId', { userId })
      .andWhere('event.timestamp >= :startDate', { startDate })
      .groupBy('event.event_type')
      .getRawMany();

    const recentActivity = await this.repo.find({
      where: {
        user_id: userId,
        timestamp: Between(startDate, new Date())
      },
      order: { timestamp: 'DESC' },
      take: 50
    });

    return {
      activity,
      recentActivity
    };
  }

  async exportAnalytics(filters: any = {}): Promise<AnalyticsEventEntity[]> {
    return this.repo.find({
      where: filters,
      order: { timestamp: 'DESC' },
      take: 10000
    });
  }
}
