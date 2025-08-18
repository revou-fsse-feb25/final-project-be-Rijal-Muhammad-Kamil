import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '@prisma/client';

export interface IUserRepository {
  createUser(createUserDTO: CreateUserDTO): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  findUserById(user_id: number): Promise<User>;
  findAllUsers(): Promise<User[]>;
  updateUser(updateUserDTO: UpdateUserDto & { user_id: number }): Promise<User>;
  deleteUser(user_id: number): Promise<User>;
}
