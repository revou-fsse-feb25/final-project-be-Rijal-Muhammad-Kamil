import { Event } from '@prisma/client';
import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';

export interface IEventRepository {
  // Create Event with Event Period and Ticket Type
  createEvent(organizer_id: number, createEventDTO: CreateEventDTO): Promise<Event>;

  // Update Event with Event Period and Ticket Type
  updateEvent(event_id: number, updateEventDTO: UpdateEventDto): Promise<Event>;

  // Delete Event and all related data
  deleteEvent(event_id: number): Promise<Event>;

  // Get Event Detail with Event Period and Ticket Type
  findEventById(event_id: number): Promise<Event>;

  // Get All Events with optional filters
  findAllEvents(params: { keyword?: string; category_id?: number; location?: string; start_date?: Date; page?: number; limit?: number }): Promise<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
  }>;

  // Find events by organizer
  findEventsByOrganizerId(organizer_id: number): Promise<Event[]>;
}
