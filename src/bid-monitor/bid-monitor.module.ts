import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BidMonitorService } from './bid-monitor.service';
import { BiddingModule } from '../bidding/bidding.module';
import { AuctionModule } from '../auction/auction.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BiddingModule,
    AuctionModule,
    RedisModule,
  ],
  providers: [BidMonitorService],
  exports: [BidMonitorService],
})
export class BidMonitorModule {}