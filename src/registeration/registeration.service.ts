import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class RegisterationService {
  constructor(private readonly fabricService: FabricService) {}

  async login(org: string, userId: string) {
    return this.fabricService.login(org, userId);
  }
}
