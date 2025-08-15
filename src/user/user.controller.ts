import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../common/guard/jwt.auth.guard';
import { RolesGuard } from '../common/guard/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { Role } from '@prisma/client';
import { UserWithProfile } from './repository/repository.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return await this.userService.findAll();
  }

  // GET /users - Get current user info
  @Get()
  async getCurrentUser(@CurrentUser() user: UserWithProfile) {
    return await this.userService.findOne(user.user_id);
  }

  // PUT /users - Update current user info
  @Put()
  async updateCurrentUser(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: UserWithProfile) {
    return await this.userService.update(user.user_id, updateUserDto);
  }

  // DELETE /users - Delete current user
  @Delete()
  async deleteCurrentUser(@CurrentUser() user: UserWithProfile) {
    await this.userService.remove(user.user_id);
    return { message: 'User deleted successfully' };
  }

  // POST /users/profile - Create user profile
  @Post('profile')
  async createProfile(@Body() createUserProfileDto: CreateUserProfileDto, @CurrentUser() user: UserWithProfile) {
    return await this.userService.createProfile(user.user_id, createUserProfileDto);
  }

  // GET /users/profile - Get current user profile
  @Get('profile')
  async getProfile(@CurrentUser() user: UserWithProfile) {
    return await this.userService.getProfile(user.user_id);
  }

  // PUT /users/profile - Update current user profile
  @Put('profile')
  async updateProfile(@Body() updateUserProfileDto: UpdateUserProfileDto, @CurrentUser() user: UserWithProfile) {
    return await this.userService.updateProfile(user.user_id, updateUserProfileDto);
  }

  // DELETE /users/profile - Delete current user profile
  @Delete('profile')
  async deleteProfile(@CurrentUser() user: UserWithProfile) {
    await this.userService.deleteProfile(user.user_id);
    return { message: 'User profile deleted successfully' };
  }
}
