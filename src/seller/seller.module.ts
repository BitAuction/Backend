import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { FabricService } from 'src/fabric/fabric.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../notification/notification.entity';
import { AuctionService } from 'src/auction/auction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [SellerController],
  providers: [
    SellerService,
    FabricService,
    NotificationGateway,
    NotificationService,
    AuctionService,
  ],
})
export class SellerModule {}
