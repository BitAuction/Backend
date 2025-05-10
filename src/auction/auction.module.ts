import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { FabricService } from 'src/fabric/fabric.service';

@Module({
  controllers: [AuctionController],
  providers: [AuctionService, FabricService],
})
export class AuctionModule {} 