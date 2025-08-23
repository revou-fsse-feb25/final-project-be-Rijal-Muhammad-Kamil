import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IUserRepository } from './repository.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDTO,
          password: await this.hashPassword(createUserDTO.password),
          role: createUserDTO.role ?? Role.ATTENDEE,
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email, deleted_at: null },
    });
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  async findUserById(user_id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { user_id, deleted_at: null },
    });
    if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return this.prisma.user.findMany({
        where: { deleted_at: null },
        orderBy: { user_id: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(user_id: number, updateUserDTO: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { user_id, deleted_at: null },
    });
    if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);

    const data: Partial<UpdateUserDto> = { ...updateUserDTO };

    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    try {
      return await this.prisma.user.update({
        where: { user_id },
        data,
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Unexpected error');
    }
  }

  async deleteUser(user_id: number): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { user_id, deleted_at: null },
    });
    if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);

    try {
      return await this.prisma.user.update({
        where: { user_id },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error?.message || 'Unexpected error');
    }
  }
}
