import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventOrganizerRepository } from './repository/repository';
import { CreateEventOrganizerDto } from './dto/create-event-organizer.dto';
import { EventOrganizer, Role, UserStatus } from '@prisma/client';
import { UpdateEventOrganizerDto } from './dto/update-event-organizer.dto';

@Injectable()
export class EventOrganizerService {
  constructor(private readonly eventOrganizerRepository: EventOrganizerRepository) {}

  private async ensureOwnershipOrAdmin(organizer_id: number, currentUser: { user_id: number; role: Role }): Promise<EventOrganizer> {
    const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizer_id);

    if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Access denied: not your Event Organizer');
    }

    return organizer;
  }

  private ensureActive(currentUser: { role: Role; status: UserStatus }) {
    if (currentUser.role !== Role.ADMIN && currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account must be active');
    }
  }

  async createEventOrganizer(currentUser: { user_id: number; role: Role; status: UserStatus }, dto: CreateEventOrganizerDto): Promise<EventOrganizer> {
    if (currentUser.role !== Role.EVENT_ORGANIZER) {
      throw new ForbiddenException('Only EVENT_ORGANIZER can create an Event Organizer');
    }

    this.ensureActive(currentUser);

    const existingEO = await this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
    if (existingEO) {
      throw new BadRequestException('User already has an Event Organizer');
    }

    return this.eventOrganizerRepository.createEventOrganizer(currentUser.user_id, dto);
  }

  async findAllEventOrganizer(currentUser: { role: Role }): Promise<EventOrganizer[]> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all Event Organizers');
    }

    return this.eventOrganizerRepository.findAllEventOrganizer();
  }

  async findEventOrganizerById(organizer_id: number): Promise<EventOrganizer> {
    return this.eventOrganizerRepository.findEventOrganizerById(organizer_id);
  }

  async findEventOrganizerByUserId(currentUser: { user_id: number; role: Role }): Promise<EventOrganizer | null> {
    if (currentUser.role !== Role.ADMIN) {
      const eo = await this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
      if (!eo) {
        throw new ForbiddenException('Access denied: not your own Event Organizer');
      }
      return eo;
    }

    return this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.user_id);
  }

  async updateEventOrganizerProfile(organizer_id: number, dto: UpdateEventOrganizerDto, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<EventOrganizer> {
    await this.ensureOwnershipOrAdmin(organizer_id, currentUser);
    this.ensureActive(currentUser);

    return this.eventOrganizerRepository.updateEventOrganizer(organizer_id, dto);
  }

  async deleteEventOrganizerProfile(organizer_id: number, currentUser: { user_id: number; role: Role; status: UserStatus }): Promise<EventOrganizer> {
    await this.ensureOwnershipOrAdmin(organizer_id, currentUser);
    this.ensureActive(currentUser);

    return this.eventOrganizerRepository.deleteEventOrganizer(organizer_id);
  }
}
