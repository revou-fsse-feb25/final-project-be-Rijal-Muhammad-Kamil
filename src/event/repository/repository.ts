import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IEventRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Event, TicketType } from '@prisma/client';
import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';
import { CreateTicketTypeDTO } from '../dto/ticket-type/create-ticket-type.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    category: true,
    organizer: {
      select: {
        organizer_id: true,
        name: true,
        logo_url: true,
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
  };

  private async softDeleteEventPeriodAndTicketType(event_id: number, tx: Prisma.TransactionClient) {
    const periods = await tx.eventPeriod.findMany({
      where: { event_id, deleted_at: null },
      select: { period_id: true },
    });

    const periodIds = periods.map((p) => p.period_id);

    if (periodIds.length > 0) {
      const ticketTypes = await tx.ticketType.findMany({
        where: { period_id: { in: periodIds }, deleted_at: null },
        select: { type_id: true },
      });
      const typeIds = ticketTypes.map((t) => t.type_id);

      if (typeIds.length > 0) {
        await tx.ticket.updateMany({
          where: { type_id: { in: typeIds }, deleted_at: null },
          data: { deleted_at: new Date() },
        });
      }

      await tx.ticketType.updateMany({
        where: { period_id: { in: periodIds }, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      await tx.eventPeriod.updateMany({
        where: { period_id: { in: periodIds }, deleted_at: null },
        data: { deleted_at: new Date() },
      });
    }
  }

  private generateTicketCode(): string {
    const shortUuid = uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase();

    return `TKT-${shortUuid}`;
  }

  private async autoGenerateTickets(ticketType: TicketType, tx: Prisma.TransactionClient): Promise<void> {
    const existingTickets = await tx.ticket.findMany({
      where: {
        type_id: ticketType.type_id,
        transaction_id: null,
        deleted_at: null,
      },
    });

    const difference = ticketType.quota - existingTickets.length;

    if (difference > 0) {
      const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];
      for (let i = 0; i < difference; i++) {
        ticketsToCreate.push({
          type_id: ticketType.type_id,
          ticket_code: this.generateTicketCode(),
        });
      }

      if (ticketsToCreate.length > 0) {
        await tx.ticket.createMany({
          data: ticketsToCreate,
        });
      }
    } else if (difference < 0) {
      const ticketsToDelete = existingTickets.slice(0, Math.abs(difference));
      const ticketIds = ticketsToDelete.map((t) => t.ticket_id);
      await tx.ticket.updateMany({
        where: { ticket_id: { in: ticketIds } },
        data: { deleted_at: new Date() },
      });
    }
  }

  async createTicketType(period_id: number, createTicketTypeDTO: CreateTicketTypeDTO): Promise<TicketType> {
    return await this.prisma.$transaction(async (tx) => {
      const period = await tx.eventPeriod.findFirst({
        where: { period_id, deleted_at: null },
        select: { period_id: true },
      });

      if (!period) {
        throw new NotFoundException(`Event period with ID ${period_id} not found`);
      }

      const category = await tx.ticketTypeCategory.findUnique({
        where: { category_id: createTicketTypeDTO.category_id },
      });

      if (!category) {
        throw new NotFoundException(`Ticket type category with ID ${createTicketTypeDTO.category_id} not found`);
      }

      try {
        const ticketType = await tx.ticketType.create({
          data: {
            period_id,
            category_id: createTicketTypeDTO.category_id,
            price: createTicketTypeDTO.price,
            discount: createTicketTypeDTO.discount,
            quota: createTicketTypeDTO.quota,
            status: createTicketTypeDTO.status,
          },
          include: {
            category: true,
            period: true,
          },
        });

        await this.autoGenerateTickets(ticketType, tx);

        return ticketType;
      } catch (error) {
        if (error.code === 'P2002') {
          const target = error.meta?.target ?? 'field';
          throw new ConflictException(`Record already exists with the same ${target}`);
        }
        throw new InternalServerErrorException('Failed to create ticket type');
      }
    });
  }

  async createEvent(organizer_id: number, createEventDTO: CreateEventDTO): Promise<Event> {
    const { category_id, ...eventData } = createEventDTO;

    return await this.prisma.$transaction(async (tx) => {
      try {
        const event = await tx.event.create({
          data: {
            ...eventData,
            organizer: { connect: { organizer_id } },
            category: { connect: { category_id } },
          },
          include: this.defaultInclude,
        });

        return event;
      } catch (error) {
        if (error.code === 'P2002') {
          const target = error.meta?.target ?? 'field';
          throw new ConflictException(`Record already exists with the same ${target}`);
        }
        throw new InternalServerErrorException('Failed to create event');
      }
    });
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
