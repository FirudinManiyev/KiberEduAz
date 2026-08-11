import type { Profile } from '@prisma/client';

export interface SupabaseJwtClaims {
  sub: string;
  email?: string;
  role?: string;
  session_id?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

/// Attached to every authenticated request. `profile.role` is the authorization
/// source of truth -- never the JWT claims, which can be stale after a role
/// change and (in the case of user_metadata) are user-editable.
export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: Profile;
}
