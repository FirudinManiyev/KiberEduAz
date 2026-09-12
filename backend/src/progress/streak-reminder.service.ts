import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

/// The `notifyStreak` preference (profile settings -> "Seriya xatırlatması")
/// existed with no producer: nothing ever read it, so the toggle did nothing.
/// This is that producer.
///
/// Runs once daily, late enough that "today" is nearly over so the reminder
/// is not premature, early enough that a UTC+4 evening still falls on the
/// same calendar day server-side (20:00 UTC).
@Injectable()
export class StreakReminderService {
  private readonly logger = new Logger(StreakReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8PM, { name: 'streak-reminders', timeZone: 'UTC' })
  async remindAtRisk(): Promise<void> {
    try {
      const sent = await this.sendReminders(new Date());

      if (sent > 0) {
        this.logger.log(`Sent ${sent} streak reminder(s)`);
      }
    } catch (error) {
      // A scheduler tick must never take the process down.
      this.logger.error(
        `Streak reminder run failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /// Exposed separately from the @Cron handler so it can be driven with a
  /// fixed `now` in tests without waiting for a real clock tick.
  async sendReminders(now: Date): Promise<number> {
    const today = startOfUtcDay(now);

    // At risk: has a streak worth protecting, opted in, has not yet acted
    // today, and is not mid-deletion.
    const atRisk = await this.prisma.userStats.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastActiveDate: { lt: today },
        profile: { notifyStreak: true, deletedAt: null },
      },
      select: { profileId: true, currentStreak: true },
    });

    for (const stats of atRisk) {
      await this.notifications.notify(stats.profileId, {
        type: 'TRAINING',
        title: `${stats.currentStreak} günlük seriyanı itirmə!`,
        body: 'Bu gün bir task tamamlayaraq seriyanı davam etdir.',
        href: '/dashboard',
      });
    }

    return atRisk.length;
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
