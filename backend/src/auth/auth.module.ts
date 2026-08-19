import { Global, Module } from '@nestjs/common';
import { SupabaseTokenService } from './supabase-token.service';

@Global()
@Module({
  providers: [SupabaseTokenService],
  exports: [SupabaseTokenService],
})
export class AuthModule {}
