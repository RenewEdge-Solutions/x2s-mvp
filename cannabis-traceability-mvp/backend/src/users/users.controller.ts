import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Simple profile fetch by username for MVP
  @Get('profile')
  async profile(@Query('username') username: string) {
    const user = await this.users.findByUsername(username);
    if (!user) return null;
    const { password, ...rest } = user as any;
    return rest;
  }
}
