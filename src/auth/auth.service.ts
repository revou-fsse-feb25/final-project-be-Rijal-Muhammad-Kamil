// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/repository/repository';
import { UserForAuth } from '../user/repository/repository.interface';
import { JwtPayload } from '../common/jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // 🔹 Validasi user untuk login
  private async validateUser(email: string, password: string): Promise<UserForAuth> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // 🔹 Login → generate JWT
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 24 * 60 * 60,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
