import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './dto/create-auth.dto';
import { UserRepository } from 'src/user/repository/reposityry';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDTO: LoginUserDTO) {
    try {
      const user = await this.userRepository.findUserByEmail(loginUserDTO.email);
      const isPasswordValid = await bcrypt.compare(loginUserDTO.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.user_id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        accessToken,
        user: {
          userId: user.user_id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'NotFoundException') {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
