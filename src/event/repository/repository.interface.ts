import { CreateEventDTO } from '../dto/event/create-event.dto';
import { Event, Prisma } from '@prisma/client';
import { UpdateEventDto } from '../dto/event/update-event.dto';

export interface IEventRepository {
  createEvent(organizer_id: number, createEventDTO: CreateEventDTO): Promise<Event>;

  updateEvent(event_id: number, updateEventDTO: UpdateEventDto, category_id?: number): Promise<Event>;

  deleteEvent(event_id: number): Promise<Event>;

  findEventById(event_id: number): Promise<Event>;

  findManyEventWithFilter(where: Prisma.EventWhereInput): Promise<Event[]>;

  findEventsByOrganizerId(organizer_id: number): Promise<Event[]>;
}
