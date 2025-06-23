import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { SellerModule } from './seller/seller.module';
import { BiddingModule } from './bidding/bidding.module';
import { AuctionModule } from './auction/auction.module';
import { RedisModule } from './redis/redis.module';
import { BidMonitorModule } from './bid-monitor/bid-monitor.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuctionModule,
    RegistrationModule,
    SellerModule,
    BiddingModule,
    RedisModule,
    BidMonitorModule,
    WebsocketModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
