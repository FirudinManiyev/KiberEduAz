import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  /// The concept doc deliberately rules out a global leaderboard for a teenage
  /// audience, so the board is scoped to the learner's class, falling back to
  /// their institution and finally to the whole instance for small pilots.
  async forCurrentUser(user: AuthenticatedUser, limit = 10) {
    const membership = await this.prisma.classMembership.findFirst({
      where: { profileId: user.id },
      include: { classGroup: true },
    });

    let scope: { type: 'class' | 'organization' | 'global'; label: string };
    let where: Prisma.ProfileWhereInput;

    if (membership) {
      scope = { type: 'class', label: membership.classGroup.name };
      where = { memberships: { some: { classGroupId: membership.classGroupId } } };
    } else if (user.profile.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: user.profile.organizationId },
        select: { name: true },
      });

      scope = { type: 'organization', label: organization?.name ?? 'Müəssisə' };
      where = { organizationId: user.profile.organizationId };
    } else {
      scope = { type: 'global', label: 'Platforma' };
      where = {};
    }

    const profiles = await this.prisma.profile.findMany({
      where,
      include: { stats: true },
    });

    const ranked = profiles
      .map((profile) => ({
        id: profile.id,
        name: displayNameFor(profile),
        initials: initialsOf(displayNameFor(profile)),
        points: profile.stats?.totalPoints ?? 0,
        roomsCompleted: profile.stats?.roomsCompleted ?? 0,
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, 'az'))
      .map((entry, index) => ({ ...entry, rank: index + 1, isCurrentUser: entry.id === user.id }));

    const currentUser = ranked.find((entry) => entry.isCurrentUser) ?? null;

    return {
      scope,
      total: ranked.length,
      currentUser,
      entries: ranked.slice(0, limit),
    };
  }
}

/// Falls back to a stable pseudonym rather than the email local-part: the
/// audience is minors and the board is shown to their peers, so an address
/// must never leak just because a learner has not set a name yet. Derived from
/// the profile id, so the same learner keeps the same label.
function displayNameFor(profile: { id: string; fullName: string | null; username: string | null }) {
  return profile.fullName ?? profile.username ?? `Tələbə #${shortCodeOf(profile.id)}`;
}

function shortCodeOf(profileId: string): string {
  let hash = 0;

  for (let index = 0; index < profileId.length; index += 1) {
    hash = (hash * 31 + profileId.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
}

function initialsOf(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toLocaleUpperCase('az');
  }

  return value.slice(0, 2).toLocaleUpperCase('az');
}
