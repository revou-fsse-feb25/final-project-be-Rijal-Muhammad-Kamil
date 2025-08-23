import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repository/repository';
import { EventOrganizerRepository } from '../event-organizer/repository/repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, EventOrganizerRepository],
  exports: [UserRepository],
})
export class UserModule {}
