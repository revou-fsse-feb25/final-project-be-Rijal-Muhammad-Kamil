import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guard/role.guard';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: CreateUserDTO })
  @ApiResponse({ status: 409, description: 'Conflict: Email or phone number already exists' })
  async createUser(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return this.userService.createUser(createUserDTO);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [CreateUserDTO] })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can view users' })
  async findAllUsers(@CurrentUser() currentUser: { role: Role }): Promise<User[]> {
    return this.userService.findAllUsers(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'User data', type: CreateUserDTO })
  @ApiResponse({ status: 403, description: 'Access denied: can only view own data' })
  async findUserById(@Param('id') id: number, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<User> {
    return this.userService.findUserById(Number(id), currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'Updated user data', type: UpdateUserDto })
  @ApiResponse({ status: 403, description: 'Access denied: can only update own data' })
  async updateUser(@Param('id') id: number, @Body() updateUserDTO: UpdateUserDto, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<User> {
    return this.userService.updateUser({ user_id: Number(id), ...updateUserDTO }, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'Deleted user data', type: CreateUserDTO })
  @ApiResponse({ status: 403, description: 'User successfully deleted' })
  async deleteUser(@Param('id') id: number, @CurrentUser() currentUser: { role: Role; userId: number }): Promise<User> {
    return this.userService.deleteUser(Number(id));
  }
}
