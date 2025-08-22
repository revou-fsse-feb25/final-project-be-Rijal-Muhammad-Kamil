import { Injectable, ForbiddenException } from '@nestjs/common';
import { EventRepository } from './repository/repository';
import { CreateEventDTO } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, Role } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(createEventDto: CreateEventDTO, currentUser: { userId: number; role: Role; organizerId?: number }): Promise<Event> {
    if (!currentUser.organizerId && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to create an event');
    }

    const organizerId = currentUser.organizerId!;
    return this.eventRepository.createEvent(createEventDto, organizerId);
  }

  async findEventById(eventId: number): Promise<Event> {
    return this.eventRepository.findEventById(eventId);
  }

  async findAllEvents(): Promise<Event[]> {
    return this.eventRepository.findAllEvents();
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto, currentUser: { userId: number; role: Role; organizerId?: number }): Promise<Event> {
    const event = await this.eventRepository.findEventById(eventId);

    if (currentUser.role !== 'ADMIN' && event.organizer_id !== currentUser.organizerId) {
      throw new ForbiddenException('You are not allowed to update this event');
    }

    return this.eventRepository.updateEvent(eventId, updateEventDto);
  }

  async deleteEvent(eventId: number, currentUser: { userId: number; role: Role; organizerId?: number }): Promise<Event> {
    const event = await this.eventRepository.findEventById(eventId);

    if (currentUser.role !== 'ADMIN' && event.organizer_id !== currentUser.organizerId) {
      throw new ForbiddenException('You are not allowed to delete this event');
    }

    return this.eventRepository.deleteEvent(eventId);
  }
}
