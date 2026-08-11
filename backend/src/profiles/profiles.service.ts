import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async me(user: AuthenticatedUser) {
    const [profile, stats, classes] = await Promise.all([
      this.prisma.profile.findUniqueOrThrow({ where: { id: user.id } }),
      this.prisma.userStats.findUnique({ where: { profileId: user.id } }),
      this.prisma.classMembership.findMany({
        where: { profileId: user.id },
        include: { classGroup: { include: { organization: true } } },
      }),
    ]);

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      username: profile.username,
      role: profile.role,
      avatarKey: profile.avatarKey,
      bio: profile.bio,
      institutionName: profile.institutionName,
      classLabel: profile.classLabel,
      focusTrack: profile.focusTrack,
      weeklyGoal: profile.weeklyGoal,
      notifications: {
        newRooms: profile.notifyNewRooms,
        streak: profile.notifyStreak,
        leaderboard: profile.notifyLeaderboard,
      },
      stats: {
        totalPoints: stats?.totalPoints ?? 0,
        currentStreak: stats?.currentStreak ?? 0,
        longestStreak: stats?.longestStreak ?? 0,
        roomsCompleted: stats?.roomsCompleted ?? 0,
        tasksCompleted: stats?.tasksCompleted ?? 0,
      },
      classes: classes.map((membership) => ({
        id: membership.classGroup.id,
        name: membership.classGroup.name,
        organization: membership.classGroup.organization.name,
      })),
    };
  }

  async update(user: AuthenticatedUser, dto: UpdateProfileDto) {
    await this.prisma.profile.update({ where: { id: user.id }, data: dto });

    return this.me(user);
  }

  async changeRole(profileId: string, role: UserRole) {
    return this.prisma.profile.update({
      where: { id: profileId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  async list() {
    return this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        institutionName: true,
        classLabel: true,
        createdAt: true,
        stats: { select: { totalPoints: true, roomsCompleted: true, currentStreak: true } },
      },
    });
  }
}
