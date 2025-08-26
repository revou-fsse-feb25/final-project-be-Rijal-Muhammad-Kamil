import { CreateUserDTO } from '../dto/create-user.dto';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserRepository {
  createUser(createUserDTO: CreateUserDTO): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(user_id: number): Promise<User>;
  findAllUsers(): Promise<User[]>;
  updateUser(user_id: number, updateUserDTO: UpdateUserDto): Promise<User>;
  deleteUser(user_id: number): Promise<User>;
}
