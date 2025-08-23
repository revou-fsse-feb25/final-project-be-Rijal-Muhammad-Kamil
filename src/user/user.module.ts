import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/reposityry';
import { EventOrganizerRepository } from '../event-organizer/repository/repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, EventOrganizerRepository],
  exports: [UserRepository],
})
export class UserModule {}
