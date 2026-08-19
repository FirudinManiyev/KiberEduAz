import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose';
import type { AppConfig } from '../config/configuration';
import type { SupabaseJwtClaims } from './auth.types';

@Injectable()
export class SupabaseTokenService {
  private readonly logger = new Logger(SupabaseTokenService.name);
  private readonly issuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly legacySecret: Uint8Array | null;

  constructor(configService: ConfigService) {
    const supabase = configService.getOrThrow<AppConfig['supabase']>('supabase');

    this.issuer = supabase.issuer;
    this.jwks = createRemoteJWKSet(new URL(supabase.jwksUrl));
    this.legacySecret = supabase.jwtSecret
      ? new TextEncoder().encode(supabase.jwtSecret)
      : null;
  }

  async verify(token: string): Promise<SupabaseJwtClaims> {
    try {
      const { alg } = decodeProtectedHeader(token);

      // Projects on the legacy shared secret issue HS256 tokens, which JWKS
      // cannot verify. Everything else is an asymmetric signing key.
      const key = alg === 'HS256' ? this.legacySecret : this.jwks;

      if (!key) {
        throw new Error('Token is HS256 but SUPABASE_JWT_SECRET is not configured');
      }

      const { payload } = await jwtVerify(token, key, {
        issuer: this.issuer,
        audience: 'authenticated',
      });

      if (!payload.sub) {
        throw new Error('Token has no subject');
      }

      return payload as unknown as SupabaseJwtClaims;
    } catch (error) {
      this.logger.debug(`Token rejected: ${(error as Error).message}`);
      throw new UnauthorizedException('Etibarsız və ya vaxtı keçmiş sessiya');
    }
  }
}
