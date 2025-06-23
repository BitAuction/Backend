import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { FabricService } from '../fabric/fabric.service';

@Module({
  controllers: [AuctionController],
  providers: [AuctionService, FabricService],
  exports: [AuctionService],
})
export class AuctionModule {}
