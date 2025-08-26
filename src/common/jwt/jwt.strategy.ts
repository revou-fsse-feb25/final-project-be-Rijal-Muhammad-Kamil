import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { jwtPayloadInterface } from './jwt-payload.interface';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(jwtpayload: jwtPayloadInterface): { userId: number; email: string; role: Role; status: UserStatus } {
    const { sub, email, role, status } = jwtpayload;
    if (!sub || !email || !role || !status) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return { userId: sub, email, role, status };
  }
}
