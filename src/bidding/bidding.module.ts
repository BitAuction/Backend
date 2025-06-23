import { Module } from '@nestjs/common';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';
import { FabricService } from '../fabric/fabric.service';

@Module({
  controllers: [BiddingController],
  providers: [BiddingService, FabricService],
  exports: [BiddingService],
})
export class BiddingModule {} 