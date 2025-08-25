import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IEventRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Event } from '@prisma/client';
import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    organizer: {
      select: {
        organizer_id: true,
        name: true,
        logo_url: true,
        user: { select: { user_id: true } },
      },
    },
    periods: {
      where: { deleted_at: null },
      orderBy: { start_date: Prisma.SortOrder.asc },
      include: {
        ticketTypes: {
          where: { deleted_at: null },
          orderBy: { price: Prisma.SortOrder.asc },
          include: { category: true },
        },
      },
    },
    category: true,
  };

  private async softDeleteEventPeriodAndTicketType(event_id: number, tx: Prisma.TransactionClient) {
    const periods = await tx.eventPeriod.findMany({
      where: { event_id, deleted_at: null },
      select: { period_id: true },
    });

    const periodIds = periods.map((p) => p.period_id);

    if (periodIds.length > 0) {
      await tx.ticketType.updateMany({
        where: { period_id: { in: periodIds }, deleted_at: null },
        data: { deleted_at: new Date() },
      });
    }

    await tx.eventPeriod.updateMany({
      where: { event_id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }

  async createEvent(organizer_id: number, createEventDTO: CreateEventDTO): Promise<Event> {
    const { category_id, ...eventData } = createEventDTO;

    try {
      return await this.prisma.event.create({
        data: {
          ...eventData,
          organizer: { connect: { organizer_id } },
          category: { connect: { category_id } },
        },
        include: this.defaultInclude,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target ?? 'field';
        throw new ConflictException(`Record already exists with the same ${target}`);
      }
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  async findEventById(event_id: number): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { event_id, deleted_at: null },
      include: this.defaultInclude,
    });

    if (!event) throw new NotFoundException(`Event with ID ${event_id} not found`);
    return event;
  }

  async findEventsByOrganizerId(organizer_id: number): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { organizer_id, deleted_at: null },
      include: this.defaultInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async findManyEventWithFilter(where: Prisma.EventWhereInput = {}): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { deleted_at: null, ...where },
      include: this.defaultInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async updateEvent(event_id: number, updateEventDTO: UpdateEventDto, category_id?: number): Promise<Event> {
    const data: Prisma.EventUpdateInput = { ...updateEventDTO };

    return await this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: { event_id, deleted_at: null },
        select: { event_id: true },
      });

      if (!event) throw new NotFoundException(`Event with ID ${event_id} not found`);

      if (category_id) {
        const categoryExists = await tx.eventCategory.findUnique({ where: { category_id } });
        if (!categoryExists) throw new NotFoundException(`Category with ID ${category_id} not found`);
        data.category = { connect: { category_id } };
      }

      try {
        return await tx.event.update({
          where: { event_id },
          data,
          include: this.defaultInclude,
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          const target = error.meta?.target ?? 'field';
          throw new ConflictException(`Record already exists with the same ${target}`);
        }
        throw new InternalServerErrorException('Failed to update event');
      }
    });
  }

  async deleteEvent(event_id: number): Promise<Event> {
    return await this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: { event_id, deleted_at: null },
        select: { event_id: true },
      });

      if (!event) throw new NotFoundException(`Event with ID ${event_id} not found`);

      await this.softDeleteEventPeriodAndTicketType(event_id, tx);

      return await tx.event.update({
        where: { event_id },
        data: { deleted_at: new Date() },
        include: this.defaultInclude,
      });
    });
  }
}
