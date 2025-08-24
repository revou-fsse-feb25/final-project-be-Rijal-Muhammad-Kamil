import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRepository } from './repository/repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { Role, User, UserStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private ensureAdmin(currentUser: { role: Role }) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

  private ensureActive(currentUser: { status: UserStatus; role: Role }) {
    if (currentUser.role !== Role.ADMIN && currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account is inactive');
    }
  }

  private ensureOwnershipOrAdmin(userId: number, currentUser: { userId: number; role: Role }) {
    if (currentUser.role !== Role.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('Access denied: not your own data');
    }
  }

  async createUser(createUserDTO: CreateUserDTO, currentUser: any): Promise<User> {
    if (currentUser) {
      throw new ForbiddenException('Logged-in users cannot create new accounts');
    }
    return this.userRepository.createUser(createUserDTO);
  }

  async findUserById(user_id: number, currentUser: { userId: number; role: Role }): Promise<User> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);
    return this.userRepository.findUserById(user_id);
  }

  async findAllUsers(currentUser: { role: Role }): Promise<User[]> {
    this.ensureAdmin(currentUser);
    return this.userRepository.findAllUsers();
  }

  async updateUser(user_id: number, updateUserDTO: UpdateUserDto, currentUser: { userId: number; role: Role; status: UserStatus }): Promise<User> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);
    this.ensureActive(currentUser);

    const dataToUpdate: Partial<UpdateUserDto> = { ...updateUserDTO };
    if (currentUser.role !== Role.ADMIN) {
      delete dataToUpdate.role;
    }

    return this.userRepository.updateUser(user_id, dataToUpdate);
  }

  async deleteUser(user_id: number, currentUser: { userId: number; role: Role }): Promise<User> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);
    return this.userRepository.deleteUser(user_id);
  }
}
