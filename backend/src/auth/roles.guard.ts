import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatus, UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { AuthenticatedUser } from './auth.types';
import { ROLES_KEY } from './decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const profile = request.user?.profile;
    const role = profile?.role;

    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Bu əməliyyat üçün icazən yoxdur');
    }

    // Teacher powers only unlock after an admin approves the account.
    if (role === UserRole.TEACHER && profile.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        profile.accountStatus === AccountStatus.PENDING
          ? 'Hesabın admin təsdiqi gözləyir'
          : 'Müəllim müraciətin rədd edilib',
      );
    }

    return true;
  }
}
