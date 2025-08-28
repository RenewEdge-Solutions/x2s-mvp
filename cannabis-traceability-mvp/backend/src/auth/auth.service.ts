import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      token: 'demo',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        email: (user as any).email,
        phone: (user as any).phone,
        address: (user as any).address,
        modules: (user as any).modules || [],
      },
      require2fa: true,
    } as const;
  }

  verify2FA(code: string) {
    if (!/^\d{6}$/.test(code)) {
      throw new UnauthorizedException('Invalid code');
    }
    return { ok: true } as const;
  }
}
