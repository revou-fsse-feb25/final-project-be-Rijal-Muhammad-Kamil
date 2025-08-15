import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './repository/repository';
import { CreateUserData, CreateUserProfileData, UpdateUserProfileData, UserWithProfile } from './repository/repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // 🔹 Utility untuk hash password
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  // 🔹 Register user + profile
  async register(userData: CreateUserData & CreateUserProfileData): Promise<UserWithProfile> {
    // Cek email sudah ada
    const emailExists = await this.userRepository.emailExists(userData.email);
    if (emailExists) throw new ConflictException('Email already exists');

    // Buat user (email saja)
    const user = await this.userRepository.createUser({ email: userData.email });

    // Buat profile + hash password
    const profileData: CreateUserProfileData = {
      ...userData,
      password: await this.hashPassword(userData.password),
    };

    return await this.userRepository.createUserProfile(user.user_id, profileData);
  }

  //  Update user profile
  async updateProfile(userId: number, updateData: UpdateUserProfileData): Promise<UserWithProfile> {
    // Jika ada password baru, hash dulu
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    return await this.userRepository.updateUserProfile(userId, updateData);
  }

  // 🔹 Delete user (beserta profile)
  async deleteUser(userId: number) {
    return await this.userRepository.deleteUser(userId);
  }

  // 🔹 Find user by ID (beserta profile)
  async findById(userId: number): Promise<UserWithProfile> {
    const user = await this.userRepository.findByIdWithProfile(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
