import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
// import { FabricModule } from '../fabric/fabric.module';
import { SimulationModule } from '../simulation/simulation.module';

@Module({
  imports: [
    // FabricModule
    SimulationModule
  ],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {} 