import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { IUserRepository, CreateUserData, CreateUserProfileData, UpdateUserData, UpdateUserProfileData, UserWithProfile , UserForAuth} from './repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Step 1: Create user (email only)
  async createUser(data: CreateUserData): Promise<User> {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already exists');

    return this.prisma.user.create({
      data: { email: data.email }
    });
  }

  // Step 2: Create user profile
  async createUserProfile(userId: number, data: CreateUserProfileData): Promise<UserWithProfile> {
    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const phoneExists = await this.prisma.userProfile.findUnique({ where: { phone_number: data.phone_number } });
    if (phoneExists) throw new ConflictException('Phone number already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        profile: {
          create: {
            ...data,
            password: hashedPassword
          }
        }
      },
      include: { profile: true }
    });
  }

  // Find user by ID (no profile)
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { user_id: id }
    });
  }

  // Find user with profile by ID
  async findByIdWithProfile(id: number): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      include: { profile: true }
    });
  }

  // Find user by email (with profile)
async findByEmail(email: string): Promise<UserForAuth | null> {
  return this.prisma.user.findUnique({
    where: { email },
    select: {
      user_id: true,
      email: true,
      profile: {
        select: {
          password: true,
          role: true,
        },
      },
    },
  }).then(user => {
    if (!user || !user.profile) return null;
    return {
      user_id: user.user_id,
      email: user.email,
      password: user.profile.password,
      role: user.profile.role,
    };
  });
}

  // Update only user table
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { user_id: id },
      data
    });
  }

  // Update only profile data
  async updateUserProfile(userId: number, data: UpdateUserProfileData): Promise<UserWithProfile> {
    if (data.phone_number) {
      const phoneExists = await this.prisma.userProfile.findUnique({ where: { phone_number: data.phone_number } });
      if (phoneExists) throw new ConflictException('Phone number already exists');
    }

    const updatedData = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { user_id: userId },
      data: {
        profile: { update: updatedData }
      },
      include: { profile: true }
    });
  }

  // Delete user (cascade profile)
  async deleteUser(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { user_id: userId } });
  }

  async deleteUserProfile(userId: number): Promise<void> {
    await this.prisma.userProfile.delete({ where: { user_id: userId } });
  }

  // Utility
  async exists(id: number): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({ where: { user_id: id } }));
  }

  async emailExists(email: string): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({ where: { email } }));
  }

  async phoneExists(phoneNumber: string): Promise<boolean> {
    return !!(await this.prisma.userProfile.findUnique({ where: { phone_number: phoneNumber } }));
  }
}
