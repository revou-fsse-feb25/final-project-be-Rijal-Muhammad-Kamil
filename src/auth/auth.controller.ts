import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/create-auth.dto';
import { Role, UserStatus } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access token and user info', type: LoginUserDTO })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginUserDTO: LoginUserDTO): Promise<{
    message: string;
    accessToken: string;
    user: {
      userId: number;
      email: string;
      role: Role;
      status: UserStatus;
    };
  }> {
    return this.authService.login(loginUserDTO);
  }
}
