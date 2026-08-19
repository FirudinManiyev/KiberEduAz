import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from './auth.types';
import { IS_PUBLIC_KEY } from './decorators';
import { SupabaseTokenService } from './supabase-token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: SupabaseTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Giriş tələb olunur');
    }

    const claims = await this.tokenService.verify(token);
    const profile = await this.resolveProfile(claims.sub, claims.email ?? '');

    (request as Request & { user: AuthenticatedUser }).user = {
      id: profile.id,
      email: profile.email,
      profile,
    };

    return true;
  }

  /// The `on_auth_user_created` trigger normally creates the profile. This
  /// covers auth users that predate the trigger.
  private async resolveProfile(id: string, email: string) {
    const existing = await this.prisma.profile.findUnique({ where: { id } });

    if (existing) return existing;

    const [profile] = await this.prisma.$transaction([
      this.prisma.profile.create({ data: { id, email } }),
      this.prisma.userStats.createMany({ data: { profileId: id }, skipDuplicates: true }),
    ]);

    return profile;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;

  const [scheme, value] = header.split(' ');

  return scheme?.toLowerCase() === 'bearer' && value ? value : null;
}
