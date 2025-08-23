import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventRepository } from './repository/repository';
import { UserRepository } from 'src/user/repository/repository';
import { CreateEventDTO } from './dto/event/create-event.dto';
import { UpdateEventDto } from './dto/event/update-event.dto';
import { SearchEventDto } from './dto/event/search-event.dto';
import { Role, Prisma } from '@prisma/client';

type EventWithRelations = Prisma.EventGetPayload<{
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

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createEvent(createEventDTO: CreateEventDTO, currentUser: { userId: number; role: Role }): Promise<EventWithRelations> {
    if (currentUser.role !== Role.EVENT_ORGANIZER) {
      throw new ForbiddenException('Only event organizers can create events');
    }

    const eventOrganizer = await this.userRepository.findEventOrganizerByUserId(currentUser.userId);
    if (!eventOrganizer) {
      throw new ForbiddenException('You must be registered as an event organizer to create events');
    }

    return this.eventRepository.createEvent(createEventDTO, eventOrganizer.organizer_id);
  }

  async findEventById(eventId: number): Promise<EventWithRelations> {
    return this.eventRepository.findEventById(eventId);
  }

  async findMyEvents(currentUser: { userId: number; role: Role }): Promise<EventWithRelations[]> {
    if (currentUser.role !== Role.EVENT_ORGANIZER) {
      throw new ForbiddenException('Only event organizers can view their events');
    }

    const eventOrganizer = await this.userRepository.findEventOrganizerByUserId(currentUser.userId);
    if (!eventOrganizer) {
      throw new ForbiddenException('You must be registered as an event organizer');
    }

    return this.eventRepository.findEventsByOrganizerId(eventOrganizer.organizer_id);
  }

  async findAllEvents(): Promise<EventWithRelations[]> {
    return this.eventRepository.findAllEvents();
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto, currentUser: { userId: number; role: Role }): Promise<EventWithRelations> {
    if (currentUser.role === Role.EVENT_ORGANIZER) {
      const isOwner = await this.eventRepository.checkEventOwnership(eventId, currentUser.userId);
      if (!isOwner) {
        throw new ForbiddenException('You can only update your own events');
      }
    } else if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only event organizers and admins can update events');
    }

    return this.eventRepository.updateEvent(eventId, updateEventDto);
  }

  async deleteEvent(eventId: number, currentUser: { userId: number; role: Role }): Promise<EventWithRelations> {
    if (currentUser.role === Role.EVENT_ORGANIZER) {
      const isOwner = await this.eventRepository.checkEventOwnership(eventId, currentUser.userId);
      if (!isOwner) {
        throw new ForbiddenException('You can only delete your own events');
      }
    } else if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only event organizers and admins can delete events');
    }

    return this.eventRepository.deleteEvent(eventId);
  }

  async findEventsByOrganizer(organizerId: number): Promise<EventWithRelations[]> {
    return this.eventRepository.findEventsByOrganizerId(organizerId);
  }

  async findEventsByOrganizerForAdmin(organizerId: number, currentUser: { userId: number; role: Role }): Promise<EventWithRelations[]> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view events by organizer');
    }

    return this.eventRepository.findEventsByOrganizerId(organizerId);
  }

  async searchEvents(searchDto: SearchEventDto): Promise<{ events: EventWithRelations[]; total: number; page: number; limit: number }> {
    return this.eventRepository.searchEvents(searchDto);
  }
}
