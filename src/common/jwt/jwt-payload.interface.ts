import { Role } from '@prisma/client';

export interface jwtPayloadInterface {
  sub: number;
  email: string;
  role: Role;
}
