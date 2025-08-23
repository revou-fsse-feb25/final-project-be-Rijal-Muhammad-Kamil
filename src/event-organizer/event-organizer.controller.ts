import { Controller, UseGuards, Post, Body, Get, ParseIntPipe, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { EventOrganizerService } from './event-organizer.service';
import { CreateEventOrganizerDto } from './dto/create-event-organizer.dto';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { Role, UserStatus } from '@prisma/client';
import { UpdateEventOrganizerDto } from './dto/update-event-organizer.dto';

@ApiTags('Event Organizer')
@Controller('event-organizer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventOrganizerController {
  constructor(private readonly eventOrganizerService: EventOrganizerService) {}

  @Post()
  @ApiOperation({ summary: 'Create event organizer profile' })
  @ApiResponse({ status: 201, description: 'Event organizer profile created successfully', type: CreateEventOrganizerDto })
  @ApiResponse({ status: 400, description: 'Bad request - User already has an event organizer profile' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only EVENT_ORGANIZER role can create profile' })
  create(@Body() createEventOrganizerDto: CreateEventOrganizerDto, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }) {
    return this.eventOrganizerService.createEventOrganizer(currentUser, createEventOrganizerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event organizers (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all event organizers' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can view all event organizers' })
  findAll(@CurrentUser() currentUser: { user_id: number; role: Role }) {
    return this.eventOrganizerService.findAllEventOrganizer(currentUser);
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Get current user event organizer profile' })
  @ApiResponse({ status: 200, description: 'Current user event organizer profile' })
  @ApiResponse({ status: 404, description: 'Event organizer profile not found' })
  findMyProfile(@CurrentUser() currentUser: { user_id: number; role: Role }) {
    return this.eventOrganizerService.findEventOrganizerByUserId(currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event organizer by ID' })
  @ApiResponse({ status: 200, description: 'Event organizer details' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only view own profile unless admin' })
  @ApiResponse({ status: 404, description: 'Event organizer not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role }) {
    return this.eventOrganizerService.findEventOrganizerById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event organizer profile' })
  @ApiResponse({ status: 200, description: 'Event organizer profile updated successfully', type: UpdateEventOrganizerDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own profile unless admin' })
  @ApiResponse({ status: 404, description: 'Event organizer not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventOrganizerDto: UpdateEventOrganizerDto, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }) {
    return this.eventOrganizerService.updateEventOrganizerProfile(id, updateEventOrganizerDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event organizer profile (soft delete)' })
  @ApiResponse({ status: 200, description: 'Event organizer profile deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own profile unless admin' })
  @ApiResponse({ status: 404, description: 'Event organizer not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }) {
    return this.eventOrganizerService.deleteEventOrganizerProfile(id, currentUser);
  }
}
