import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IEventOrganizerRepository } from './repository.interface';
import { CreateEventOrganizerDto } from '../dto/create-event-organizer.dto';
import { EventOrganizer } from '@prisma/client';
import { InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateEventOrganizerDto } from '../dto/update-event-organizer.dto';

@Injectable()
export class EventOrganizerRepository implements IEventOrganizerRepository {
  constructor(private prisma: PrismaService) {}

  async createEventOrganizer(user_id: number, createEventOrganizerDto: CreateEventOrganizerDto): Promise<EventOrganizer> {
    try {
      return await this.prisma.eventOrganizer.create({
        data: {
          name: createEventOrganizerDto.name,
          address: createEventOrganizerDto.address,
          description: createEventOrganizerDto.description,
          logo_url: createEventOrganizerDto.logo_url,
          user: {
            connect: {
              user_id: user_id,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Event organizer name already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventOrganizerById(organizer_id: number): Promise<EventOrganizer> {
    try {
      const organizer = await this.prisma.eventOrganizer.findFirst({
        where: {
          organizer_id,
          deleted_at: null,
        },
      });

      if (!organizer) {
        throw new NotFoundException('Event organizer not found');
      }

      return organizer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventOrganizerByUserId(user_id: number): Promise<EventOrganizer | null> {
    try {
      const organizer = await this.prisma.eventOrganizer.findFirst({
        where: {
          user_id,
          deleted_at: null,
        },
      });

      return organizer;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllEventOrganizer(): Promise<EventOrganizer[]> {
    try {
      return this.prisma.eventOrganizer.findMany({
        where: { deleted_at: null },
        orderBy: { organizer_id: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateEventOrganizer(organizer_id: number, updateEventOrganizerDto: UpdateEventOrganizerDto): Promise<EventOrganizer> {
    const organizer = await this.prisma.eventOrganizer.findFirst({
      where: { organizer_id, deleted_at: null },
    });

    if (!organizer) {
      throw new NotFoundException('Event organizer not found');
    }

    try {
      return await this.prisma.eventOrganizer.update({
        where: { organizer_id },
        data: updateEventOrganizerDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Event organizer name already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteEventOrganizer(organizer_id: number): Promise<EventOrganizer> {
    const organizer = await this.prisma.eventOrganizer.findFirst({
      where: { organizer_id, deleted_at: null },
    });

    if (!organizer) {
      throw new NotFoundException('Event organizer not found');
    }

    try {
      return await this.prisma.eventOrganizer.update({
        where: { organizer_id },
        data: { deleted_at: new Date() },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
