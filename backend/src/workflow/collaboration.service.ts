import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaborationSessionEntity } from './collaboration-session.entity';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(CollaborationSessionEntity) private sessionRepo: Repository<CollaborationSessionEntity>,
  ) {}

  async joinSession(recordId: string, userId: string, userName: string): Promise<CollaborationSessionEntity> {
    let session = await this.sessionRepo.findOne({ where: { record_id: recordId, status: 'active' } });

    if (!session) {
      // Create new session
      session = this.sessionRepo.create({
        record_id: recordId,
        active_users: [{
          user_id: userId,
          user_name: userName,
          joined_at: new Date()
        }],
        last_activity: new Date()
      });
    } else {
      // Add user to existing session
      const userIndex = session.active_users.findIndex(u => u.user_id === userId);
      if (userIndex === -1) {
        session.active_users.push({
          user_id: userId,
          user_name: userName,
          joined_at: new Date()
        });
      }
      session.last_activity = new Date();
    }

    return this.sessionRepo.save(session);
  }

  async leaveSession(recordId: string, userId: string): Promise<CollaborationSessionEntity> {
    const session = await this.sessionRepo.findOne({ where: { record_id: recordId, status: 'active' } });
    if (!session) throw new Error('Session not found');

    session.active_users = session.active_users.filter(u => u.user_id !== userId);
    session.last_activity = new Date();

    // Close session if no active users
    if (session.active_users.length === 0) {
      session.status = 'closed';
    }

    return this.sessionRepo.save(session);
  }

  async updateCursorPosition(recordId: string, userId: string, position: any): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { record_id: recordId, status: 'active' } });
    if (!session) return;

    const user = session.active_users.find(u => u.user_id === userId);
    if (user) {
      user.cursor_position = position;
      session.last_activity = new Date();
      await this.sessionRepo.save(session);
    }
  }

  async proposeChange(recordId: string, userId: string, field: string, value: any): Promise<CollaborationSessionEntity> {
    const session = await this.sessionRepo.findOne({ where: { record_id: recordId, status: 'active' } });
    if (!session) throw new Error('Session not found');

    session.pending_changes.push({
      user_id: userId,
      field,
      value,
      timestamp: new Date()
    });

    session.last_activity = new Date();

    return this.sessionRepo.save(session);
  }

  async lockRecord(recordId: string, userId: string): Promise<CollaborationSessionEntity> {
    const session = await this.sessionRepo.findOne({ where: { record_id: recordId } });
    if (!session) throw new Error('Session not found');

    if (session.locked_by && session.locked_by !== userId) {
      throw new Error('Record is locked by another user');
    }

    session.status = 'locked';
    session.locked_by = userId;
    session.locked_at = new Date();

    return this.sessionRepo.save(session);
  }

  async unlockRecord(recordId: string, userId: string): Promise<CollaborationSessionEntity> {
    const session = await this.sessionRepo.findOne({ where: { record_id: recordId } });
    if (!session) throw new Error('Session not found');

    if (session.locked_by !== userId) {
      throw new Error('You do not have permission to unlock this record');
    }

    session.status = 'active';
    session.locked_by = null;
    session.locked_at = null;

    return this.sessionRepo.save(session);
  }

  async getActiveSession(recordId: string): Promise<CollaborationSessionEntity | null> {
    return this.sessionRepo.findOne({ where: { record_id: recordId, status: 'active' } });
  }

  async cleanupStaleSessions(inactiveMinutes = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - inactiveMinutes);

    const staleSessions = await this.sessionRepo
      .createQueryBuilder('session')
      .where('session.last_activity < :cutoff', { cutoff })
      .andWhere('session.status = :status', { status: 'active' })
      .getMany();

    for (const session of staleSessions) {
      session.status = 'closed';
      await this.sessionRepo.save(session);
    }

    return staleSessions.length;
  }
}
