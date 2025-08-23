import { Module } from '@nestjs/common';
import { EventOrganizerService } from './event-organizer.service';
import { EventOrganizerController } from './event-organizer.controller';
import { EventOrganizerRepository } from './repository/repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventOrganizerController],
  providers: [EventOrganizerService, EventOrganizerRepository],
  exports: [EventOrganizerRepository],
})
export class EventOrganizerModule {}
