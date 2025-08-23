import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventOrganizerRepository } from './repository/repository';
import { CreateEventOrganizerDto } from './dto/create-event-organizer.dto';
import { EventOrganizer, Role, UserStatus } from '@prisma/client';
import { UpdateEventOrganizerDto } from './dto/update-event-organizer.dto';

@Injectable()
export class EventOrganizerService {
  constructor(private readonly eventOrganizerRepository: EventOrganizerRepository) {}

  async createEventOrganizer(currentUser: { user_id: number; role: Role; status: UserStatus }, createEventOrganizerDto: CreateEventOrganizerDto): Promise<EventOrganizer> {
    if (currentUser.role !== Role.EVENT_ORGANIZER) {
      throw new ForbiddenException('Only EVENT_ORGANIZER can create an Event Organizer');
    }

    if (currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account must be active to create an Event Organizer');
    }

    const existingEO = await this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
    if (existingEO) {
      throw new BadRequestException('User already has an Event Organizer');
    }

    return this.eventOrganizerRepository.createEventOrganizer(currentUser.user_id, createEventOrganizerDto);
  }

  async findAllEventOrganizer(currentUser: { user_id: number; role: Role }): Promise<EventOrganizer[]> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all Event Organizers');
    }

    return this.eventOrganizerRepository.findAllEventOrganizer();
  }

  async findEventOrganizerById(organizer_id: number, currentUser: { user_id: number; role: Role }): Promise<EventOrganizer> {
    const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizer_id);

    if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Access denied: you can only view your own Event Organizer');
    }

    return organizer;
  }

  async findEventOrganizerByUserId(currentUser: { user_id: number; role: Role }): Promise<EventOrganizer | null> {
    return this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
  }

  async updateEventOrganizerProfile(organizer_id: number, updateEventOrganizerDto: UpdateEventOrganizerDto, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<EventOrganizer> {
    const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizer_id);

    if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.user_id) {
      throw new ForbiddenException('You can only update your own event organizer profile');
    }

    if (currentUser.role !== Role.ADMIN && currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account must be active to update an Event Organizer');
    }

    return this.eventOrganizerRepository.updateEventOrganizer(organizer_id, updateEventOrganizerDto);
  }

  async deleteEventOrganizerProfile(organizer_id: number, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<EventOrganizer> {
    const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizer_id);

    if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.user_id) {
      throw new ForbiddenException('You can only delete your own event organizer profile');
    }

    return this.eventOrganizerRepository.deleteEventOrganizer(organizer_id);
  }
}
