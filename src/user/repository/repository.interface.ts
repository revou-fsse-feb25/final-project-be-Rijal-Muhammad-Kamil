import { CreateUserDTO } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '@prisma/client';

export interface IUserRepository {
  createUser(createUserDTO: CreateUserDTO): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  findUserById(user_id: number): Promise<User>;
  findAllUsers(): Promise<User[]>;
  updateUser(user_id: number, updateUserDTO: UpdateUserDto): Promise<User>;
  deleteUser(user_id: number): Promise<User>;
}
