import { CreateEventOrganizerDto } from '../dto/create-event-organizer.dto';
import { UpdateEventOrganizerDto } from '../dto/update-event-organizer.dto';
import { EventOrganizer } from '@prisma/client';

export interface IEventOrganizerRepository {
  createEventOrganizer(user_id: number, createEventOrganizerDto: CreateEventOrganizerDto): Promise<EventOrganizer>;
  findEventOrganizerById(organizer_id: number): Promise<EventOrganizer>;
  findEventOrganizerByUserId(user_id: number): Promise<EventOrganizer | null>;
  findAllEventOrganizer(): Promise<EventOrganizer[]>;
  updateEventOrganizer(organizer_id: number, updateEventOrganizerDto: UpdateEventOrganizerDto): Promise<EventOrganizer>;
  deleteEventOrganizer(organizer_id: number): Promise<EventOrganizer>;
}
