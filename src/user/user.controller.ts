import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guard/role.guard';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateEventOrganizerDto } from './dto/create-event-organizer.dto';
import { UpdateEventOrganizerDto } from './dto/update-event-organizer.dto';
import { Role, User, EventOrganizer } from '@prisma/client';
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
  async findUserById(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<User> {
    return this.userService.findUserById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'Updated user data', type: UpdateUserDto })
  @ApiResponse({ status: 403, description: 'Access denied: can only update own data' })
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDTO: UpdateUserDto, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<User> {
    return this.userService.updateUser(id, updateUserDTO, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'Deleted user data', type: CreateUserDTO })
  @ApiResponse({ status: 403, description: 'Forbidden: can only delete own account' })
  async deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<User> {
    return this.userService.deleteUser(id, currentUser);
  }

  @Post('event-organizers')
  @ApiOperation({ summary: 'Create a new Event Organizer' })
  @ApiResponse({ status: 201, description: 'Event Organizer successfully created', type: CreateEventOrganizerDto })
  @ApiResponse({ status: 400, description: 'User already has an Event Organizer' })
  @ApiResponse({ status: 403, description: 'Only ATTENDEE or ADMIN can create an Event Organizer' })
  async createEventOrganizer(@Body() createEventOrganizerDto: CreateEventOrganizerDto, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
    return this.userService.createEventOrganizer(createEventOrganizerDto, currentUser);
  }

  @Get('event-organizers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all Event Organizers (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of Event Organizers', type: [CreateEventOrganizerDto] })
  async findAllEventOrganizers(@CurrentUser() currentUser: { role: Role }): Promise<EventOrganizer[]> {
    return this.userService.findAllEventOrganizer(currentUser);
  }

  @Get('event-organizers/:id')
  @ApiOperation({ summary: 'Get Event Organizer by ID (own or admin)' })
  @ApiResponse({ status: 200, description: 'Event Organizer data', type: CreateEventOrganizerDto })
  @ApiResponse({ status: 403, description: 'Access denied: can only view your own Event Organizer' })
  async findEventOrganizerById(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
    return this.userService.findEventOrganizerById(id, currentUser);
  }

  @Patch('event-organizers/:id')
  @ApiOperation({ summary: 'Update Event Organizer by ID (own or admin)' })
  @ApiResponse({ status: 200, description: 'Updated Event Organizer data', type: UpdateEventOrganizerDto })
  @ApiResponse({ status: 403, description: 'Access denied: can only update your own Event Organizer' })
  async updateEventOrganizer(@Param('id', ParseIntPipe) id: number, @Body() updateEventOrganizerDto: UpdateEventOrganizerDto, @CurrentUser() currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
    return this.userService.updateEventOrganizer(id, updateEventOrganizerDto, currentUser);
  }
}
