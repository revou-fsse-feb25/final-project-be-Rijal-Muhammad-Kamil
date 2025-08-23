import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRepository } from './repository/repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDTO: CreateUserDTO, currentUser: any): Promise<User> {
    if (currentUser) {
      throw new ForbiddenException('Logged-in users cannot create new accounts');
    }

    return this.userRepository.createUser(createUserDTO);
  }

  async findUserById(user_id: number, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && user_id !== currentUser.userId) {
      throw new ForbiddenException('Access denied: you can only view your own data');
    }
    return this.userRepository.findUserById(user_id);
  }

  async findAllUsers(currentUser: { role: Role }): Promise<User[]> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all users');
    }
    return this.userRepository.findAllUsers();
  }

  async updateUser(user_id: number, updateUserDTO: UpdateUserDto, currentUser: { userId: number; role: Role; status: UserStatus }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && user_id !== currentUser.userId) {
      throw new ForbiddenException('Access denied: you can only update your own data');
    }

    if (currentUser.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Access denied: your account is inactive');
    }

    const dataToUpdate: Partial<UpdateUserDto> = { ...updateUserDTO };
    if (currentUser.role !== 'ADMIN') {
      delete dataToUpdate.role;
    }

    return this.userRepository.updateUser(user_id, dataToUpdate);
  }

  async deleteUser(user_id: number, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== user_id) {
      throw new ForbiddenException('Access denied: you can only delete your own account');
    }

    return this.userRepository.deleteUser(user_id);
  }
}
