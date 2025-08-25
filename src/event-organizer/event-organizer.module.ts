import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventOrganizerController } from './event-organizer.controller';
import { EventOrganizerService } from './event-organizer.service';
import { EventOrganizerRepository } from './repository/repository';

@Module({
  imports: [PrismaModule],
  controllers: [EventOrganizerController],
  providers: [EventOrganizerService, EventOrganizerRepository],
  exports: [EventOrganizerRepository],
})
export class EventOrganizerModule {}
