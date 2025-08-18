import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRepository } from './repository/reposityry';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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

  async updateUser(updateUserDTO: UpdateUserDto & { user_id: number }, currentUser: { userId: number; role: Role }): Promise<User> {
    if (currentUser.role !== 'ADMIN' && updateUserDTO.user_id !== currentUser.userId) {
      throw new ForbiddenException('Access denied: you can only update your own data');
    }
    return this.userRepository.updateUser(updateUserDTO);
  }

  async deleteUser(userId: number): Promise<User> {
    return this.userRepository.deleteUser(userId);
  }
}
