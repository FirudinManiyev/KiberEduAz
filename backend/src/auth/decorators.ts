import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import type { AuthenticatedUser } from './auth.types';

export const IS_PUBLIC_KEY = 'auth:public';
export const ROLES_KEY = 'auth:roles';

/// Opts a route out of authentication entirely.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/// Restricts a route to the given profile roles.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    return context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>().user;
  },
);
