import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class RegistrationService {
  constructor(private readonly fabricService: FabricService) {}

  async login(org: string, userId: string) {
    return this.fabricService.login(org, userId);
  }

  logout(org: string, userId: string) {
    // TODO: clear cache/session if exist
    return { message: `User ${userId} from ${org} logged out` };
  }
}
