import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { FabricService } from 'src/fabric/fabric.service';

@Module({
  controllers: [SellerController],
  providers: [SellerService, FabricService],
})
export class SellerModule {}
