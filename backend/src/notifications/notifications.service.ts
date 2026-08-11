import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class NotificationsService {
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
}
