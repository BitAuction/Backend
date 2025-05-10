import { Module } from '@nestjs/common';
import { RegisterationModule } from './registeration/registeration.module';
import { SellerModule } from './seller/seller.module';
import { BiddingModule } from './bidding/bidding.module';
import { AuctionModule } from './auction/auction.module';

@Module({
  imports: [
    AuctionModule,
    RegisterationModule,
    SellerModule,
    BiddingModule,
  ],
})
export class AppModule {}
