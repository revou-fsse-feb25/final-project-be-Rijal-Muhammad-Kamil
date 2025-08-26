import { Role, UserStatus } from '@prisma/client';

export interface jwtPayloadInterface {
  sub: number;
  email: string;
  role: Role;
  status: UserStatus;
}
