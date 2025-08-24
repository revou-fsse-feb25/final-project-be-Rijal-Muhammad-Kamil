import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event } from '@prisma/client';
import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    organizer: { include: { user: true } },
    periods: {
      where: { deleted_at: null },
      include: {
        ticketTypes: {
          where: { deleted_at: null },
          include: { category: true },
        },
      },
    },
    category: true,
  };

  private async findActiveEventOrThrow(event_id: number): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { event_id, deleted_at: null },
      include: this.defaultInclude,
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${event_id} not found`);
    }
    return event;
  }

  async createEvent(organizer_id: number, category_id: number, createEventDTO: CreateEventDTO): Promise<Event> {
    try {
      return await this.prisma.event.create({
        data: {
          ...createEventDTO,
          organizer: { connect: { organizer_id } },
          category: { connect: { category_id } },
        },
        include: this.defaultInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('Event with this title already exists');
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  async findAllEvents(params: { keyword?: string; category_id?: number; location?: string; start_date?: Date; page?: number; limit?: number }): Promise<{ events: Event[]; total: number; page: number; limit: number }> {
    const { keyword, category_id, location, start_date, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: null };
    if (keyword) where.OR = [{ title: { contains: keyword, mode: 'insensitive' } }, { description: { contains: keyword, mode: 'insensitive' } }];
    if (category_id) where.category_id = category_id;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (start_date) where.periods = { some: { start_date: { gte: start_date }, deleted_at: null } };

    try {
      const [events, total] = await Promise.all([this.prisma.event.findMany({ where, include: this.defaultInclude, orderBy: { created_at: 'desc' }, skip, take: limit }), this.prisma.event.count({ where })]);
      return { events, total, page, limit };
    } catch {
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  async findEventsByOrganizerId(organizer_id: number): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { organizer_id, deleted_at: null },
      include: this.defaultInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async updateEvent(event_id: number, updateEventDTO: UpdateEventDto, category_id?: number): Promise<Event> {
    await this.findActiveEventOrThrow(event_id);

    const data: any = { ...updateEventDTO };
    if (category_id) data.category = { connect: { category_id } };

    try {
      return await this.prisma.event.update({
        where: { event_id },
        data,
        include: this.defaultInclude,
      });
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('Event with this title already exists');
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  async deleteEvent(event_id: number): Promise<Event> {
    await this.findActiveEventOrThrow(event_id);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const periods = await tx.eventPeriod.findMany({
          where: { event_id, deleted_at: null },
          select: { period_id: true },
        });
        const periodIds = periods.map((p) => p.period_id);

        if (periodIds.length) {
          await tx.ticketType.updateMany({
            where: { period_id: { in: periodIds }, deleted_at: null },
            data: { deleted_at: new Date() },
          });
        }

        await tx.eventPeriod.updateMany({
          where: { event_id, deleted_at: null },
          data: { deleted_at: new Date() },
        });

        const deletedEvent = await tx.event.update({
          where: { event_id },
          data: { deleted_at: new Date() },
          include: this.defaultInclude,
        });

        return deletedEvent;
      });
    } catch {
      throw new InternalServerErrorException('Failed to delete event');
    }
  }

  async findEventById(event_id: number): Promise<Event> {
    return this.findActiveEventOrThrow(event_id);
  }
}
