import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { SellerModule } from './seller/seller.module';
import { BiddingModule } from './bidding/bidding.module';
import { AuctionModule } from './auction/auction.module';
import { RedisModule } from './redis/redis.module';
import { BidMonitorModule } from './bid-monitor/bid-monitor.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [
    AuctionModule, 
    RegistrationModule, 
    SellerModule, 
    BiddingModule,
    RedisModule,
    BidMonitorModule,
    WebsocketModule,
    SimulationModule,
  ],
})
export class AppModule {}
