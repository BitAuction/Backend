import { Controller, Post, Body } from '@nestjs/common';
import { RegisterationService } from './registeration.service';

@Controller('registeration')
export class RegisterationController {
  constructor(private readonly registerationService: RegisterationService) {}

  @Post('login')
  async login(@Body() body: { org: string; userId: string }) {
    return this.registerationService.login(body.org, body.userId);
  }
}
