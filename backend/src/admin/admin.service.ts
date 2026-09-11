import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, ContentStatus, UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
    private readonly audit: AuditService,
  ) {}

  stats() {
    return this.prisma.$transaction(async (tx) => {
      const [
        users,
        students,
        teachersActive,
        teachersPending,
        classes,
        roomsPublished,
        roomsDraft,
        paths,
      ] = await Promise.all([
        // Accounts pending deletion are already gone as far as the platform
        // is concerned, so they should not inflate the headline counts.
        tx.profile.count({ where: { deletedAt: null } }),
        tx.profile.count({ where: { role: UserRole.STUDENT, deletedAt: null } }),
        tx.profile.count({
          where: { role: UserRole.TEACHER, accountStatus: AccountStatus.ACTIVE, deletedAt: null },
        }),
        tx.profile.count({
          where: { role: UserRole.TEACHER, accountStatus: AccountStatus.PENDING, deletedAt: null },
        }),
        tx.classGroup.count(),
        tx.room.count({ where: { status: ContentStatus.PUBLISHED } }),
        tx.room.count({ where: { status: ContentStatus.DRAFT } }),
        tx.path.count(),
      ]);

      return {
        users,
        students,
        teachersActive,
        teachersPending,
        classes,
        roomsPublished,
        roomsDraft,
        paths,
      };
    });
  }

  pendingTeachers() {
    return this.profilesService.listPendingTeachers();
  }

  async approveTeacher(actor: AuthenticatedUser, id: string) {
    const result = await this.profilesService.approveTeacher(id);

    await this.audit.record({
      actorId: actor.id,
      action: 'teacher.approve',
      targetType: 'profile',
      targetId: id,
    });

    return result;
  }

  async rejectTeacher(actor: AuthenticatedUser, id: string) {
    const result = await this.profilesService.rejectTeacher(id);

    await this.audit.record({
      actorId: actor.id,
      action: 'teacher.reject',
      targetType: 'profile',
      targetId: id,
    });

    return result;
  }

  pendingRooms() {
    return this.prisma.room.findMany({
      where: { status: ContentStatus.DRAFT },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        module: {
          select: {
            id: true,
            title: true,
            path: { select: { id: true, title: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async approveRoom(actor: AuthenticatedUser, id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });

    if (!room) throw new NotFoundException('Room tapılmadı');

    await this.audit.record({
      actorId: actor.id,
      action: 'room.publish',
      targetType: 'room',
      targetId: id,
      metadata: { slug: room.slug },
    });

    return this.prisma.room.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
      },
    });
  }

  async rejectRoom(actor: AuthenticatedUser, id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });

    if (!room) throw new NotFoundException('Room tapılmadı');

    await this.audit.record({
      actorId: actor.id,
      action: 'room.archive',
      targetType: 'room',
      targetId: id,
      metadata: { slug: room.slug },
    });

    return this.prisma.room.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED },
      select: { id: true, slug: true, title: true, status: true },
    });
  }
}
