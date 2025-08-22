import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';
import { SearchEventDto } from '../dto/event/search-event.dto';
import { Prisma } from '@prisma/client';

export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    category: true;
    organizer: {
      include: {
        user: true;
      };
    };
    periods: {
      include: {
        ticketTypes: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

export interface IEventRepository {
  createEvent(createEventDTO: CreateEventDTO, organizerId: number): Promise<EventWithRelations>;

  findEventById(eventId: number): Promise<EventWithRelations>;

  findEventsByOrganizerId(organizerId: number): Promise<EventWithRelations[]>;

  findAllEvents(): Promise<EventWithRelations[]>;

  updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<EventWithRelations>;

  deleteEvent(eventId: number): Promise<EventWithRelations>;

  checkEventOwnership(eventId: number, userId: number): Promise<boolean>;

  searchEvents(searchDto: SearchEventDto): Promise<{
    events: EventWithRelations[];
    total: number;
    page: number;
    limit: number;
  }>;
}
