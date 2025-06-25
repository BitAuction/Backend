import { Controller, Post, Body } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller('registration') // TODO: Use JWT for sessions and security
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('login')
  async login(@Body() body: { org: string; userId: string }) {
    return this.registrationService.login(body.org, body.userId);
  }

  @Post('logout')
  logout(@Body() body: { org: string; userId: string }) {
    return this.registrationService.logout(body.org, body.userId);
  }
}
