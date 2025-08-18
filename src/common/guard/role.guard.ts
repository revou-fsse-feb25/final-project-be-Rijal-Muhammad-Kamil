import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: { userId: number; email: string; role: Role };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil roles yang diperlukan dari decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // Jika tidak ada role yang ditentukan, akses diizinkan
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Ambil user dari request (harus sudah lewat JwtAuthGuard)
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Akses ditolak: role tidak sesuai');
    }

    return true;
  }
}
