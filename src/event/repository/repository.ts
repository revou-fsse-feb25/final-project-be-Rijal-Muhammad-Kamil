import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event, EventPeriod } from '@prisma/client';
import { CreateEventDTO } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { CreateEventPeriodDTO } from '../dto/create-event-period.dto';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDTO, organizerId: number): Promise<Event> {
    try {
      return await this.prisma.event.create({
        data: {
          title: createEventDto.title,
          description: createEventDto.description,
          terms: createEventDto.terms,
          location: createEventDto.location,
          image_url: createEventDto.image_url,
          status: createEventDto.status ?? 'active',
          organizer: { connect: { organizer_id: organizerId } },
          category: { connect: { category_id: createEventDto.category_id } },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventById(eventId: number): Promise<Event> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { event_id: eventId },
        include: { organizer: true, category: true },
      });

      if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllEvents(): Promise<Event[]> {
    try {
      return await this.prisma.event.findMany({
        include: { organizer: true, category: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<Event> {
    try {
      const existingEvent = await this.prisma.event.findUnique({ where: { event_id: eventId } });
      if (!existingEvent) throw new NotFoundException(`Event with ID ${eventId} not found`);

      return await this.prisma.event.update({
        where: { event_id: eventId },
        data: {
          title: updateEventDto.title,
          description: updateEventDto.description,
          terms: updateEventDto.terms,
          location: updateEventDto.location,
          image_url: updateEventDto.image_url,
          status: updateEventDto.status,
          ...(updateEventDto.category_id ? { category: { connect: { category_id: updateEventDto.category_id } } } : {}),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteEvent(eventId: number): Promise<Event> {
    try {
      const existingEvent = await this.prisma.event.findUnique({ where: { event_id: eventId } });
      if (!existingEvent) throw new NotFoundException(`Event with ID ${eventId} not found`);

      return await this.prisma.event.delete({ where: { event_id: eventId } });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateEventPeriod(periodId: number, dto: CreateEventPeriodDTO): Promise<EventPeriod> {
    try {
      const existing = await this.prisma.eventPeriod.findUnique({ where: { period_id: periodId } });
      if (!existing) throw new NotFoundException(`EventPeriod with ID ${periodId} not found`);

      return await this.prisma.eventPeriod.update({
        where: { period_id: periodId },
        data: {
          name: dto.name,
          start_date: new Date(dto.start_date),
          end_date: new Date(dto.end_date),
          start_time: dto.start_time,
          end_time: dto.end_time,
          status: dto.status ?? existing.status,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventPeriodById(periodId: number): Promise<EventPeriod> {
    try {
      const period = await this.prisma.eventPeriod.findUnique({
        where: { period_id: periodId },
      });
      if (!period) throw new NotFoundException(`EventPeriod with ID ${periodId} not found`);
      return period;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllEventPeriods(eventId: number): Promise<EventPeriod[]> {
    try {
      return await this.prisma.eventPeriod.findMany({ where: { event_id: eventId } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteEventPeriod(periodId: number): Promise<EventPeriod> {
    try {
      const existing = await this.prisma.eventPeriod.findUnique({ where: { period_id: periodId } });
      if (!existing) throw new NotFoundException(`EventPeriod with ID ${periodId} not found`);

      return await this.prisma.eventPeriod.delete({ where: { period_id: periodId } });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
