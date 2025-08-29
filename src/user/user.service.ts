import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRepository } from './repository/repository';
import { Role, UserStatus, User } from '@prisma/client';
import { CreateUserDTO } from './dto/create-user.dto';
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

  private ensureOwnershipOrAdmin(user_id: number, currentUser: { user_id: number; role: Role }) {
    if (currentUser.role !== Role.ADMIN && currentUser.user_id !== user_id) {
      throw new ForbiddenException('Access denied: not your own data');
    }
  }

  private omitPassword(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(createUserDTO: CreateUserDTO, currentUser?: { user_id: number; role: Role }): Promise<User> {
    if (currentUser?.user_id) {
      throw new ForbiddenException('Logged-in users cannot create new accounts');
    }

    const user = await this.userRepository.createUser(createUserDTO);

    return user;
  }

  async findUserById(user_id: number, currentUser: { user_id: number; role: Role }): Promise<Omit<User, 'password'>> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);

    const user = await this.userRepository.findUserById(user_id);

    return this.omitPassword(user);
  }

  async findAllUsers(currentUser: { role: Role }): Promise<Omit<User, 'password'>[]> {
    this.ensureAdmin(currentUser);

    const users = await this.userRepository.findAllUsers();
    return users.map((user) => this.omitPassword(user));
  }

  async updateUser(user_id: number, updateUserDTO: UpdateUserDto, currentUser: { user_id: number; role: Role; status: UserStatus }, adminStatus?: UserStatus, adminRole?: Role): Promise<Omit<User, 'password'>> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);
    this.ensureActive(currentUser);

    const dataToUpdate: Partial<UpdateUserDto & { status?: UserStatus; role?: Role }> = { ...updateUserDTO };

    if (currentUser.role === Role.ADMIN) {
      dataToUpdate.status = adminStatus ?? dataToUpdate.status;
      dataToUpdate.role = adminRole ?? dataToUpdate.role;

      Object.keys(dataToUpdate).forEach((key) => {
        if (!['status', 'role'].includes(key)) delete dataToUpdate[key];
      });
    } else {
      delete dataToUpdate.status;
      delete dataToUpdate.role;
    }

    const updatedUser = await this.userRepository.updateUser(user_id, dataToUpdate);

    if (currentUser.role === Role.ADMIN) {
      return this.omitPassword(updatedUser);
    }

    return this.omitPassword(updatedUser);
  }

  async deleteUser(user_id: number, currentUser: { user_id: number; role: Role }): Promise<Omit<User, 'password'>> {
    this.ensureOwnershipOrAdmin(user_id, currentUser);

    const deletedUser = await this.userRepository.deleteUser(user_id);

    if (currentUser.role === Role.ADMIN) {
      return this.omitPassword(deletedUser);
    }

    return this.omitPassword(deletedUser);
  }
}
