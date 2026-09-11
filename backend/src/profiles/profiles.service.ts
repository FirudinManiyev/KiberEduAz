import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { RequestTeacherDto, UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async me(user: AuthenticatedUser) {
    const [profile, stats, classes, taughtClasses] = await Promise.all([
      this.prisma.profile.findUniqueOrThrow({ where: { id: user.id } }),
      this.prisma.userStats.findUnique({ where: { profileId: user.id } }),
      this.prisma.classMembership.findMany({
        where: { profileId: user.id },
        include: { classGroup: { include: { organization: true } } },
      }),
      this.prisma.classGroup.findMany({
        where: { teacherId: user.id },
        include: { organization: true, _count: { select: { memberships: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      username: profile.username,
      role: profile.role,
      accountStatus: profile.accountStatus,
      avatarKey: profile.avatarKey,
      bio: profile.bio,
      institutionName: profile.institutionName,
      classLabel: profile.classLabel,
      focusTrack: profile.focusTrack,
      weeklyGoal: profile.weeklyGoal,
      organizationId: profile.organizationId,
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
      taughtClasses: taughtClasses.map((group) => ({
        id: group.id,
        name: group.name,
        organization: group.organization.name,
        studentCount: group._count.memberships,
      })),
    };
  }

  async update(user: AuthenticatedUser, dto: UpdateProfileDto) {
    await this.prisma.profile.update({ where: { id: user.id }, data: dto });

    return this.me(user);
  }

  /// Student self-register, then request teacher access. Stays PENDING until admin approves.
  async requestTeacher(user: AuthenticatedUser, dto: RequestTeacherDto) {
    const profile = await this.prisma.profile.findUniqueOrThrow({ where: { id: user.id } });

    if (profile.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin hesabı müəllim müraciəti göndərə bilməz');
    }

    if (profile.role === UserRole.TEACHER && profile.accountStatus === AccountStatus.ACTIVE) {
      throw new ConflictException('Artıq təsdiqlənmiş müəllim hesabısan');
    }

    if (profile.role === UserRole.TEACHER && profile.accountStatus === AccountStatus.PENDING) {
      throw new ConflictException('Müəllim müraciətin artıq gözləmədədir');
    }

    await this.prisma.profile.update({
      where: { id: user.id },
      data: {
        role: UserRole.TEACHER,
        accountStatus: AccountStatus.PENDING,
        institutionName: dto.institutionName,
      },
    });

    return this.me(user);
  }

  async changeRole(actor: AuthenticatedUser, profileId: string, role: UserRole) {
    const before = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { role: true },
    });

    if (!before) throw new NotFoundException('İstifadəçi tapılmadı');

    await this.audit.record({
      actorId: actor.id,
      action: 'profile.role.change',
      targetType: 'profile',
      targetId: profileId,
      metadata: { from: before.role, to: role },
    });

    const data: { role: UserRole; accountStatus?: AccountStatus } = { role };

    if (role === UserRole.TEACHER) {
      data.accountStatus = AccountStatus.ACTIVE;
    }

    if (role === UserRole.STUDENT) {
      data.accountStatus = AccountStatus.ACTIVE;
    }

    return this.prisma.profile.update({
      where: { id: profileId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountStatus: true,
      },
    });
  }

  async approveTeacher(profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) throw new NotFoundException('İstifadəçi tapılmadı');
    if (profile.role !== UserRole.TEACHER) {
      throw new BadRequestException('Bu istifadəçi müəllim müraciəti göndərməyib');
    }

    const defaultOrg = await this.ensureDefaultOrganization();

    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        organizationId: profile.organizationId ?? defaultOrg.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountStatus: true,
        institutionName: true,
      },
    });
  }

  async rejectTeacher(profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) throw new NotFoundException('İstifadəçi tapılmadı');
    if (profile.role !== UserRole.TEACHER) {
      throw new BadRequestException('Bu istifadəçi müəllim müraciəti göndərməyib');
    }

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { accountStatus: AccountStatus.REJECTED },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountStatus: true,
      },
    });
  }

  async listPendingTeachers() {
    return this.prisma.profile.findMany({
      where: {
        role: UserRole.TEACHER,
        accountStatus: AccountStatus.PENDING,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        institutionName: true,
        createdAt: true,
        accountStatus: true,
        role: true,
      },
    });
  }

  async list() {
    return this.prisma.profile.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        role: true,
        accountStatus: true,
        institutionName: true,
        classLabel: true,
        createdAt: true,
        stats: { select: { totalPoints: true, roomsCompleted: true, currentStreak: true } },
      },
    });
  }

  async ensureDefaultOrganization() {
    return this.prisma.organization.upsert({
      where: { slug: 'kiberedu-default' },
      create: { slug: 'kiberedu-default', name: 'KiberEduAz' },
      update: {},
    });
  }
}
