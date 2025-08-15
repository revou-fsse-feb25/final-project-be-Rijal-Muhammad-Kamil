import { User, UserProfile, Gender, Role } from '@prisma/client';

/**
 * Data untuk membuat user (Step 1)
 */
export interface CreateUserData {
  email: string;
}

/**
 * Data untuk membuat user profile (Step 2)
 */
export interface CreateUserProfileData {
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: Gender;
  phone_number: string;
  password: string;
  role?: Role; // Optional
}

/**
 * Data untuk update user
 */
export interface UpdateUserData {
  email?: string;
}

/**
 * Data untuk update user profile
 */
export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: Gender;
  phone_number?: string;
  password?: string;
  role?: Role;
}

/**
 * User dengan profile lengkap (CRUD biasa)
 */
export interface UserWithProfile extends User {
  profile?: UserProfile | null;
}

/**
 * User untuk autentikasi (login) saja
 */
export interface UserForAuth {
  user_id: number;
  email: string;
  password: string;
  role: Role;
}

/**
 * Repository interface
 */
export interface IUserRepository {
  // Create operations
  createUser(userData: CreateUserData): Promise<User>;
  createUserProfile(userId: number, profileData: CreateUserProfileData): Promise<UserWithProfile>;

  // Read operations
  findById(id: number): Promise<User | null>;
  findByIdWithProfile(id: number): Promise<UserWithProfile | null>;
  findByEmail(email: string, includePassword?: boolean): Promise<UserWithProfile | UserForAuth | null>;

  // Update operations
  updateUser(id: number, userData: UpdateUserData): Promise<User>;
  updateUserProfile(userId: number, profileData: UpdateUserProfileData): Promise<UserWithProfile>;

  // Delete operations
  deleteUser(id: number): Promise<void>;
  deleteUserProfile(userId: number): Promise<void>;

  // Utility operations
  exists(id: number): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  phoneExists(phoneNumber: string): Promise<boolean>;
}
