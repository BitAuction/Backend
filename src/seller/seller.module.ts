import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { FabricService } from 'src/fabric/fabric.service';
import { AuctionGateway } from 'src/auction/auction.gateway';

@Module({
  controllers: [SellerController],
  providers: [SellerService, FabricService, AuctionGateway],
})
export class SellerModule {}
