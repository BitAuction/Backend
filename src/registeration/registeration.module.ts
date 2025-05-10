import { Module } from '@nestjs/common';
import { RegisterationController } from './registeration.controller';
import { RegisterationService } from './registeration.service';
import { FabricService } from '../fabric/fabric.service';

@Module({
  controllers: [RegisterationController],
  providers: [RegisterationService, FabricService]
})
export class RegisterationModule {}
