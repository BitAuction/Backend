import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification') // TODO: Authorization (Sensitive Information)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user')
  async getUserNotifications(@Query('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch('mark-all-seen')
  async markAllAsSeen(@Body('userId') userId: string) {
    return await this.notificationService.markAllAsSeen(userId);
  }

  @Patch('mark-seen')
  async markAsSeen(@Body('notificationId') notificationId: number) {
    return this.notificationService.markAsSeen(notificationId);
  }
}
