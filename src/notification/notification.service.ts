import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    auctionId: string,
    type: 'winner' | 'timeout',
  ) {
    const notification = this.notificationRepo.create({
      userId,
      auctionId,
      type,
    });
    return this.notificationRepo.save(notification);
  }

  async markAsSeen(notificationId: number) {
    return this.notificationRepo.update(notificationId, { seen: true });
  }

  async markAllAsSeen(userId: string) {
    return this.notificationRepo.update({ userId }, { seen: true });
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async notificationExist(
    auctionID: string,
    userId: string,
    type: 'winner' | 'timeout',
  ): Promise<boolean> {
    const notification = await this.notificationRepo.findOne({
      where: { auctionId: auctionID, userId: userId, type: type },
    });
    return !!notification;
  }
}
