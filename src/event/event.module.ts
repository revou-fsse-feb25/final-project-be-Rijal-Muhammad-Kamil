import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './repository/repository';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService, EventRepository],
})
export class EventModule {}
