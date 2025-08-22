import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDTO } from './dto/event/create-event.dto';
import { UpdateEventDto } from './dto/event/update-event.dto';
import { SearchEventDto } from './dto/event/search-event.dto';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guard/role.guard';
import { Roles } from '../common/decorator/role.decorator';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EVENT_ORGANIZER)
  @ApiOperation({ summary: 'Create a new event (Event Organizer only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: CreateEventDTO })
  @ApiResponse({ status: 403, description: 'Access denied: Only event organizers can create events' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createEvent(@Body() createEventDTO: CreateEventDTO, @CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.eventService.createEvent(createEventDTO, currentUser);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EVENT_ORGANIZER)
  @ApiOperation({ summary: 'Get all events created by current event organizer' })
  @ApiResponse({ status: 200, description: 'List of events created by current organizer' })
  @ApiResponse({ status: 403, description: 'Access denied: Only event organizers can view their events' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findMyEvents(@CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.eventService.findMyEvents(currentUser);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all events (Public access)' })
  @ApiResponse({ status: 200, description: 'List of all events in the system' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllEvents() {
    return this.eventService.findAllEvents();
  }

  @Get('organizer/:organizerId')
  @ApiOperation({ summary: 'Get all events by specific organizer (Public access)' })
  @ApiResponse({ status: 200, description: 'List of events by specific organizer' })
  @ApiResponse({ status: 404, description: 'Organizer not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findEventsByOrganizer(@Param('organizerId', ParseIntPipe) organizerId: number) {
    return this.eventService.findEventsByOrganizer(organizerId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search events by category, location, start date (Public access)' })
  @ApiResponse({
    status: 200,
    description: 'List of events matching search criteria with pagination',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid search parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchEvents(@Query() searchDto: SearchEventDto) {
    return this.eventService.searchEvents(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findEventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.findEventById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EVENT_ORGANIZER, Role.ADMIN)
  @ApiOperation({ summary: 'Update event (Own events for Event Organizer, all events for Admin)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only update own events' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Bad request: Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateEvent(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto, @CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.eventService.updateEvent(id, updateEventDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EVENT_ORGANIZER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete event (Own events for Event Organizer, all events for Admin)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only delete own events' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { userId: number; role: Role }) {
    return this.eventService.deleteEvent(id, currentUser);
  }
}
