import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthenticatedUser) {
    const items = await this.prisma.notification.findMany({
      where: { profileId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      unreadCount: items.filter((item) => !item.readAt).length,
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        href: item.href,
        unread: !item.readAt,
        createdAt: item.createdAt,
      })),
    };
  }

  async markRead(user: AuthenticatedUser, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, profileId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return this.list(user);
  }

  async markAllRead(user: AuthenticatedUser) {
    await this.prisma.notification.updateMany({
      where: { profileId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return this.list(user);
  }

  async create(profileId: string, input: { type: NotificationType; title: string; body?: string; href?: string }) {
    return this.prisma.notification.create({
      data: {
        profileId,
        type: input.type,
        title: input.title,
        body: input.body ?? '',
        href: input.href,
      },
    });
  }

  /// Same as create, but a failure is logged rather than thrown. Notifying
  /// somebody is a side effect of an action, never its point: failing to tell
  /// a teacher their account was approved must not roll back the approval.
  async notify(
    profileId: string,
    input: { type: NotificationType; title: string; body?: string; href?: string },
  ): Promise<void> {
    try {
      await this.create(profileId, input);
    } catch (error) {
      this.logger.error(
        `Failed to notify ${profileId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /// Announces a newly published room to the learners who asked to hear about
  /// them. Respects the notifyNewRooms preference, skips accounts pending
  /// deletion, and is fire-and-forget for the same reason as notify().
  async announceRoom(room: { slug: string; title: string }): Promise<void> {
    try {
      const learners = await this.prisma.profile.findMany({
        where: { role: UserRole.STUDENT, notifyNewRooms: true, deletedAt: null },
        select: { id: true },
      });

      if (!learners.length) return;

      await this.prisma.notification.createMany({
        data: learners.map((learner) => ({
          profileId: learner.id,
          type: NotificationType.TRAINING,
          title: `Yeni Room: ${room.title}`,
          body: 'Yeni təlim dərc olundu. Başlamaq üçün Room-u aç.',
          href: `/rooms/${room.slug}`,
        })),
      });

      this.logger.log(`Announced room ${room.slug} to ${learners.length} learners`);
    } catch (error) {
      this.logger.error(
        `Failed to announce room ${room.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
