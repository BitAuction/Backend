import { Module } from '@nestjs/common';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { FabricService } from '../fabric/fabric.service';

@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService, FabricService],
})
export class RegistrationModule {}
