import { Controller, UseGuards, Post, Body, Get, Param, ParseIntPipe, Query, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventService } from './event.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { CreateEventDTO } from './dto/event/create-event.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UpdateEventDto } from './dto/event/update-event.dto';
import { CreateTicketTypeDTO } from './dto/ticket-type/create-ticket-type.dto';
import { Role, UserStatus, Event, TicketType } from '@prisma/client';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Event Organizer only)' })
  @ApiResponse({ status: 201, description: 'Event successfully created', type: CreateEventDTO })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or missing event organizer profile' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only EVENT_ORGANIZER can create events or account inactive' })
  async createEvent(@Body() createEventDTO: CreateEventDTO, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Event> {
    return this.eventService.createEvent(createEventDTO, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findEventById(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventService.findEventById(id);
  }

  @Get('organizer/:organizer_id')
  @ApiOperation({ summary: 'Get events by organizer ID' })
  @ApiResponse({ status: 200, description: 'List of events by organizer' })
  @ApiResponse({ status: 404, description: 'Organizer not found' })
  async findEventsByOrganizerId(@Param('organizer_id', ParseIntPipe) organizer_id: number): Promise<Event[]> {
    return this.eventService.findEventsByOrganizerId(organizer_id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get events with filter (Public)',
    description: `
    Retrieve a list of events with optional filters:
    - search (by title)
    - category_id
    - location
    - start_date (returns events starting on this date)

    If no filters are provided, all active events will be returned.
  `,
  })
  @ApiResponse({ status: 200, description: 'List of events successfully retrieved', type: [Event] })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameter format (e.g., invalid date)' })
  async findManyEventWithFilter(@Query('search') search?: string, @Query('category_id') category_id?: string, @Query('location') location?: string, @Query('start_date') start_date?: string): Promise<Event[]> {
    const catId = category_id ? parseInt(category_id) : undefined;
    return this.eventService.findManyWithFilter(search, catId, location, start_date);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event by ID (Event Organizer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated event data', type: UpdateEventDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own events unless admin' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }, @Query('category_id') category_id?: string): Promise<Event> {
    const parsedCategoryId = category_id && !isNaN(Number(category_id)) ? Number(category_id) : undefined;
    return this.eventService.updateEvent(id, updateEventDto, currentUser, parsedCategoryId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (Event Organizer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Event successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only event owner or admin can delete events' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: { user_id: number; role: Role }): Promise<Event> {
    return this.eventService.deleteEvent(id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('periods/:period_id/ticket-types')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create ticket type for event period (Event Organizer/Admin only)',
    description: 'Creates a new ticket type for the specified event period. Tickets will be automatically generated based on the quota specified.',
  })
  @ApiResponse({ status: 201, description: 'Ticket type successfully created with auto-generated tickets', type: CreateTicketTypeDTO })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or period not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only event owner or admin can create ticket types' })
  @ApiResponse({ status: 404, description: 'Event period or ticket type category not found' })
  async createTicketType(@Param('period_id', ParseIntPipe) period_id: number, @Body() createTicketTypeDTO: CreateTicketTypeDTO, @CurrentUser() currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<TicketType> {
    return this.eventService.createTicketType(period_id, createTicketTypeDTO, currentUser);
  }
}
