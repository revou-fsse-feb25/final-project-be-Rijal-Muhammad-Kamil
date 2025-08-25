import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { IEventOrganizerRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventOrganizer } from '@prisma/client';
import { CreateEventOrganizerDto } from '../dto/create-event-organizer.dto';
import { UpdateEventOrganizerDto } from '../dto/update-event-organizer.dto';

@Injectable()
export class EventOrganizerRepository implements IEventOrganizerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async findEventOrganizerActive(organizer_id: number): Promise<EventOrganizer> {
    const organizer = await this.prisma.eventOrganizer.findFirst({
      where: { organizer_id, deleted_at: null },
    });

    if (!organizer) {
      throw new NotFoundException(`Event organizer with ID ${organizer_id} not found`);
    }

    return organizer;
  }

  async createEventOrganizer(user_id: number, createEventOrganizerDto: CreateEventOrganizerDto): Promise<EventOrganizer> {
    try {
      return await this.prisma.eventOrganizer.create({
        data: {
          ...createEventOrganizerDto,
          user: { connect: { user_id } },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target ?? 'field';
        throw new ConflictException(`Record already exists with the same ${target}`);
      }
      throw new InternalServerErrorException('Failed to create event organizer');
    }
  }

  async findEventOrganizerById(organizer_id: number): Promise<EventOrganizer> {
    return this.findEventOrganizerActive(organizer_id);
  }

  async findEventOrganizerByUserId(user_id: number): Promise<EventOrganizer | null> {
    const organizer = await this.prisma.eventOrganizer.findFirst({
      where: { user_id, deleted_at: null },
    });
    if (!organizer) {
      throw new NotFoundException(`Event organizer for user_id ${user_id} not found`);
    }

    return organizer;
  }

  async findAllEventOrganizer(): Promise<EventOrganizer[]> {
    return this.prisma.eventOrganizer.findMany({
      where: { deleted_at: null },
      orderBy: { organizer_id: 'asc' },
    });
  }

  async updateEventOrganizer(organizer_id: number, updateEventOrganizerDto: UpdateEventOrganizerDto): Promise<EventOrganizer> {
    await this.findEventOrganizerActive(organizer_id);

    try {
      return await this.prisma.eventOrganizer.update({
        where: { organizer_id },
        data: updateEventOrganizerDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target ?? 'field';
        throw new ConflictException(`Record already exists with the same ${target}`);
      }
      throw new InternalServerErrorException('Failed to update event organizer');
    }
  }

  async deleteEventOrganizer(organizer_id: number): Promise<EventOrganizer> {
    await this.findEventOrganizerActive(organizer_id);

    try {
      return await this.prisma.eventOrganizer.update({
        where: { organizer_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Event organizer with ID ${organizer_id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete event organizer');
    }
  }
}
