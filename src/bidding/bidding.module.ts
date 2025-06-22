import { Module } from '@nestjs/common';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';
// import { FabricModule } from '../fabric/fabric.module';
import { SimulationModule } from '../simulation/simulation.module';

@Module({
  imports: [
    // FabricModule
    SimulationModule
  ],
  controllers: [BiddingController],
  providers: [BiddingService],
  exports: [BiddingService],
})
export class BiddingModule {} 