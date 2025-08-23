import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repository/reposityry';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateEventOrganizerDto } from '../event-organizer/dto/create-event-organizer.dto';
import { UpdateEventOrganizerDto } from '../event-organizer/dto/update-event-organizer.dto';
import { EventOrganizerRepository } from '../event-organizer/repository/repository';
import { Role, User, EventOrganizer } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventOrganizerRepository: EventOrganizerRepository,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    return this.userRepository.createUser(createUserDTO);
  }

  async findUserById(userId: number, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && userId !== currentUser.userId) {
      throw new ForbiddenException('Access denied: you can only view your own data');
    }
    return this.userRepository.findUserById(userId);
  }

  async findAllUsers(currentUser: { role: Role }): Promise<User[]> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all users');
    }
    return this.userRepository.findAllUsers();
  }

  async updateUser(user_id: number, updateUserDTO: UpdateUserDto, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && user_id !== currentUser.userId) {
      throw new ForbiddenException('Access denied: you can only update your own data');
    }
    return this.userRepository.updateUser(user_id, updateUserDTO);
  }

  async deleteUser(userId: number, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
      throw new ForbiddenException('Access denied: you can only delete your own account');
    }

    return this.userRepository.deleteUser(userId);
  }

  // async createEventOrganizer(createEventOrganizerDto: CreateEventOrganizerDto, currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
  //   if (currentUser.role !== Role.ATTENDEE && currentUser.role !== Role.ADMIN) {
  //     throw new ForbiddenException('Only ATTENDEE or ADMIN can create an Event Organizer');
  //   }

  //   const existingEO = await this.eventOrganizerRepository.findEventOrganizerByUserId(currentUser.userId);
  //   if (existingEO) {
  //     throw new BadRequestException('User already has an Event Organizer');
  //   }

  //   return this.eventOrganizerRepository.createEventOrganizer(currentUser.userId, createEventOrganizerDto);
  // }

  // async findAllEventOrganizer(currentUser: { role: Role }): Promise<EventOrganizer[]> {
  //   if (currentUser.role !== Role.ADMIN) {
  //     throw new ForbiddenException('Only admins can view all Event Organizers');
  //   }

  //   return this.eventOrganizerRepository.findAllEventOrganizer();
  // }
  // async findEventOrganizerById(organizerId: number, currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
  //   const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizerId);

  //   if (!organizer) {
  //     throw new NotFoundException(`Event Organizer with ID ${organizerId} not found`);
  //   }

  //   if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.userId) {
  //     throw new ForbiddenException('Access denied: you can only view your own Event Organizer');
  //   }

  //   return organizer;
  // }

  // async updateEventOrganizer(organizer_id: number, updateEventOrganizerDto: UpdateEventOrganizerDto, currentUser: { userId: number; role: Role }): Promise<EventOrganizer> {
  //   const organizer = await this.eventOrganizerRepository.findEventOrganizerById(organizer_id);
  //   if (!organizer) {
  //     throw new NotFoundException(`Event Organizer with ID ${organizer_id} not found`);
  //   }

  //   if (currentUser.role !== Role.ADMIN && organizer.user_id !== currentUser.userId) {
  //     throw new ForbiddenException('Access denied: you can only update your own Event Organizer');
  //   }

  //   return this.eventOrganizerRepository.updateEventOrganizer(updateEventOrganizerDto, organizer_id);
  // }
}
