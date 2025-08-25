import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventOrganizerRepository } from 'src/event-organizer/repository/repository';
import { EventRepository } from './repository/repository';
import { CreateEventDTO } from './dto/event/create-event.dto';
import { Role, UserStatus, Event, Prisma } from '@prisma/client';
import { UpdateEventDto } from './dto/event/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    private readonly eventOrganizerRepository: EventOrganizerRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  private ensureActive(currentUser: { role: Role; status: UserStatus }) {
    if (currentUser.role !== Role.ADMIN && currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account must be active to perform this action');
    }
  }

  private async ensureEventOrganizer(currentUser: { user_id: number; role: Role }) {
    if (currentUser.role !== Role.EVENT_ORGANIZER) {
      throw new ForbiddenException('Only EVENT_ORGANIZER can manage events');
    }

    const organizer = await this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
    if (!organizer) {
      throw new BadRequestException('You must have an event organizer profile to manage events');
    }

    return organizer;
  }

  async createEvent(createEventDTO: CreateEventDTO, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<Event> {
    this.ensureActive(currentUser);
    const organizer = await this.ensureEventOrganizer(currentUser);
    return this.eventRepository.createEvent(organizer.organizer_id, createEventDTO);
  }

  async findEventById(event_id: number): Promise<Event> {
    return this.eventRepository.findEventById(event_id);
  }

  async findEventsByOrganizerId(organizer_id: number): Promise<Event[]> {
    return this.eventRepository.findEventsByOrganizerId(organizer_id);
  }

  async findManyWithFilter(search?: string, category_id?: number, location?: string, start_date?: string): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {
      deleted_at: null,
      ...(category_id && { category_id }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(start_date && { periods: { some: { start_date: { gte: start_date }, deleted_at: null } } }),
    };

    return this.eventRepository.findManyEventWithFilter(where);
  }

  async updateEvent(event_id: number, updateEventDTO: UpdateEventDto, currentUser: { user_id: number; role: Role; status: UserStatus }, category_id?: number): Promise<Event> {
    this.ensureActive(currentUser);

    const event = await this.eventRepository.findEventById(event_id);

    if (currentUser.role !== Role.ADMIN) {
      const organizer = await this.ensureEventOrganizer(currentUser);
      if (event.organizer_id !== organizer.organizer_id) {
        throw new ForbiddenException('You can only update your own events');
      }
    }

    return this.eventRepository.updateEvent(event_id, updateEventDTO, category_id);
  }

  async deleteEvent(event_id: number, currentUser: { user_id: number; role: Role }): Promise<Event> {
    const event = await this.eventRepository.findEventById(event_id);

    if (currentUser.role !== Role.ADMIN) {
      const organizer = await this.eventOrganizerRepository.findEventOrganizerById(event.organizer_id);
      if (organizer.user_id !== currentUser.user_id) {
        throw new ForbiddenException('You can only delete your own events');
      }
    }

    return this.eventRepository.deleteEvent(event_id);
  }
}
