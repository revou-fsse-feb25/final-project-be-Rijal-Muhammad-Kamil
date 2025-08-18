// import { Injectable, ForbiddenException } from '@nestjs/common';
// import { UserRepository } from './user.repository';
// import { CreateUserDTO } from '../dto/create-user.dto';
// import { UpdateUserDto } from '../dto/update-user.dto';
// import { User } from '@prisma/client';

// @Injectable()
// export class UserService {
//   constructor(private readonly userRepo: UserRepository) {}

//   async createUser(createUserDTO: CreateUserDTO): Promise<User> {
//     return this.userRepo.createUser(createUserDTO);
//   }

//   async getUserById(user_id: number, currentUserId: number): Promise<User> {
//     if (user_id !== currentUserId) {
//       throw new ForbiddenException('You can only access your own account');
//     }
//     return this.userRepo.findUserById(user_id);
//   }

//   async updateUser(
//     user_id: number,
//     updateUserDTO: UpdateUserDto,
//     currentUserId: number,
//   ): Promise<User> {
//     if (user_id !== currentUserId) {
//       throw new ForbiddenException('You can only update your own account');
//     }
//     return this.userRepo.updateUser({ ...updateUserDTO, user_id });
//   }

//   async deleteUser(user_id: number, currentUserId: number): Promise<User> {
//     if (user_id !== currentUserId) {
//       throw new ForbiddenException('You can only delete your own account');
//     }
//     return this.userRepo.deleteUser(user_id);
//   }

//   async getAllUsers(): Promise<User[]> {
//     // Hanya untuk admin misal, bisa ditambahkan check role di controller/service
//     return this.userRepo.findAllUsers();
//   }
// }
