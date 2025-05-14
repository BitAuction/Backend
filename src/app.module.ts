import { Module } from '@nestjs/common';
import { RegistrationModule } from './registration/registration.module';
import { SellerModule } from './seller/seller.module';
import { BiddingModule } from './bidding/bidding.module';
import { AuctionModule } from './auction/auction.module';

@Module({
  imports: [AuctionModule, RegistrationModule, SellerModule, BiddingModule],
})
export class AppModule {}
