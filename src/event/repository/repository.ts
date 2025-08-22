import { Injectable } from '@nestjs/common';
import { Prisma, EventStatus } from '@prisma/client';
import { IEventRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDTO } from '../dto/event/create-event.dto';
import { UpdateEventDto } from '../dto/event/update-event.dto';
import { SearchEventDto } from '../dto/event/search-event.dto';

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
export class EventRepository implements IEventRepository {
  constructor(private prisma: PrismaService) {}

  async createEvent(createEventDTO: CreateEventDTO, organizerId: number): Promise<EventWithRelations> {
    try {
      const event = await this.prisma.event.create({
        data: {
          ...createEventDTO,
          organizer_id: organizerId,
        },
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
      return event;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventById(eventId: number): Promise<EventWithRelations> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { event_id: eventId },
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findEventsByOrganizerId(organizerId: number): Promise<EventWithRelations[]> {
    try {
      const events = await this.prisma.event.findMany({
        where: { organizer_id: organizerId },
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      return events;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllEvents(): Promise<EventWithRelations[]> {
    try {
      const events = await this.prisma.event.findMany({
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      return events;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateEvent(eventId: number, updateEventDto: UpdateEventDto): Promise<EventWithRelations> {
    try {
      const updatedEvent = await this.prisma.event.update({
        where: { event_id: eventId },
        data: updateEventDto,
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
      return updatedEvent;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteEvent(eventId: number): Promise<EventWithRelations> {
    try {
      const deletedEvent = await this.prisma.event.delete({
        where: { event_id: eventId },
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
      return deletedEvent;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkEventOwnership(eventId: number, userId: number): Promise<boolean> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { event_id: eventId },
        include: {
          organizer: true,
        },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      return event.organizer?.user_id === userId;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchEvents(searchDto: SearchEventDto): Promise<{ events: EventWithRelations[]; total: number; page: number; limit: number }> {
    try {
      const { category_id, location, start_date, search, page = 1, limit = 10 } = searchDto;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.EventWhereInput = {
        status: EventStatus.ACTIVE,
        ...(category_id && { category_id }),
        ...(location && {
          location: {
            contains: location,
            mode: 'insensitive',
          },
        }),
        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
        ...(start_date && {
          periods: {
            some: {
              start_date: {
                gte: new Date(start_date),
              },
            },
          },
        }),
      };

      const total = await this.prisma.event.count({
        where: whereClause,
      });

      const events = await this.prisma.event.findMany({
        where: whereClause,
        include: {
          category: true,
          organizer: {
            include: {
              user: true,
            },
          },
          periods: {
            include: {
              ticketTypes: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      });

      return {
        events,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
