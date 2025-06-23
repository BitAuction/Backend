import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { SellerModule } from './seller/seller.module';
import { BiddingModule } from './bidding/bidding.module';
import { AuctionModule } from './auction/auction.module';
import { RedisModule } from './redis/redis.module';
import { BidMonitorModule } from './bid-monitor/bid-monitor.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    AuctionModule,
    RegistrationModule,
    SellerModule,
    BiddingModule,
    RedisModule,
    BidMonitorModule,
    WebsocketModule,
    NotificationModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // Makes env variables accessible everywhere
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
