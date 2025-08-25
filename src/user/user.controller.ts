import { Controller, Post, Body, UseGuards, Get, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { RolesGuard } from 'src/common/guard/role.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { Role, User, UserStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (Public)' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: CreateUserDTO })
  @ApiResponse({ status: 403, description: 'Logged-in users cannot create new accounts' })
  async createUser(@Body() createUserDTO: CreateUserDTO, @CurrentUser() currentUser?: { user_id: number; role: Role }): Promise<Omit<User, 'password'>> {
    return this.userService.createUser(createUserDTO, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can view users' })
  async findAllUsers(@CurrentUser() currentUser: { user_id: number; role: Role }): Promise<Omit<User, 'password'>[]> {
    return this.userService.findAllUsers(currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 403, description: 'Access denied: can only view own data' })
  async findUserById(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role }): Promise<Omit<User, 'password'>> {
    return this.userService.findUserById(id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'Updated user data' })
  @ApiResponse({ status: 403, description: 'Access denied: can only update own data or account inactive' })
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDTO: UpdateUserDto, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Omit<User, 'password'>> {
    return this.userService.updateUser(id, updateUserDTO, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'Deleted user data' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only delete own account' })
  async deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role }): Promise<Omit<User, 'password'>> {
    return this.userService.deleteUser(id, currentUser);
  }
}
