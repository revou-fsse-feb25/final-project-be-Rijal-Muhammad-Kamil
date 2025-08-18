import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserRepository } from '../repository/repository.interface';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

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
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException(`User with email ${email} not found`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserById(user_id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { user_id } });
      if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return this.prisma.user.findMany({ orderBy: { user_id: 'asc' } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(updateUserDTO: UpdateUserDto & { user_id: number }): Promise<User> {
    const { user_id, ...data } = updateUserDTO;

    if ('password' in data && data.password) {
      data.password = await this.hashPassword(data.password);
    }

    try {
      return await this.prisma.user.update({
        where: { user_id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone number already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteUser(user_id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { user_id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
