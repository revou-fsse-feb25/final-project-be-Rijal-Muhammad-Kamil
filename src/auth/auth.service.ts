import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from 'src/user/repository/repository';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDTO } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDTO: LoginUserDTO) {
    try {
      const user = await this.userRepository.findUserByEmail(loginUserDTO.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginUserDTO.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.user_id, email: user.email, role: user.role, status: user.status };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        accessToken,
        user: {
          userId: user.user_id,
          email: user.email,
          role: user.role as Role,
          status: user.status as UserStatus,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong during login');
    }
  }
}
