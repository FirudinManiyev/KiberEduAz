import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { AppConfig } from '../config/configuration';

/// How long a deleted account can still be restored before it is purged.
export const RESTORE_WINDOW_DAYS = 30;

@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /// Step one: mark the account. JwtAuthGuard refuses a marked profile from
  /// the next request on, so access stops immediately even though the rows
  /// are still there.
  async requestDeletion(user: AuthenticatedUser) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: user.id },
      select: { deletedAt: true },
    });

    if (!profile) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    const deletedAt = profile.deletedAt ?? new Date();

    await this.prisma.profile.update({
      where: { id: user.id },
      data: { deletedAt },
    });

    this.logger.log(`Account ${user.id} marked for deletion`);

    return {
      deletedAt,
      purgeAfter: this.purgeCutoffFrom(deletedAt),
      restoreWindowDays: RESTORE_WINDOW_DAYS,
    };
  }

  /// Admin-only undo, for the window before the purge. Self-service restore is
  /// impossible by design: a marked account cannot authenticate.
  async restore(profileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { deletedAt: true },
    });

    if (!profile) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    await this.prisma.profile.update({
      where: { id: profileId },
      data: { deletedAt: null },
    });

    this.logger.log(`Account ${profileId} restored`);

    return { restored: true };
  }

  /// Nightly at 03:00 server time. In-process so no admin token has to live
  /// in a cron job; idempotent, so if the free plan ever runs two instances
  /// the second pass simply finds nothing due. The admin endpoint remains for
  /// running it by hand.
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'purge-deleted-accounts' })
  async purgeExpiredOnSchedule(): Promise<void> {
    try {
      const result = await this.purgeExpired();

      if (result.due > 0) {
        this.logger.log(
          `Scheduled purge: ${result.purged}/${result.due} accounts removed, ${result.failed.length} failed`,
        );
      }
    } catch (error) {
      // A scheduler tick must never take the process down.
      this.logger.error(
        `Scheduled purge crashed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /// Step two, run on a schedule: hard-delete everything whose restore window
  /// has expired.
  ///
  /// Profile is the root of the cascade, so AnswerAttempt, PointsLedger,
  /// ClassMembership, UserStats, RoomProgress, TaskProgress and Notification
  /// all go with it (onDelete: Cascade). Authored content does NOT: Path,
  /// LearningModule and Room set created_by_id to null, because deleting a
  /// teacher must not take a published curriculum down with them.
  async purgeExpired() {
    const cutoff = new Date(Date.now() - RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const due = await this.prisma.profile.findMany({
      where: { deletedAt: { not: null, lt: cutoff } },
      select: { id: true, email: true },
    });

    const purged: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const profile of due) {
      try {
        // The auth user goes first: if that fails, the profile stays behind
        // and is retried on the next run, rather than being orphaned in
        // Supabase Auth with no local record of it.
        await this.deleteAuthUser(profile.id);
        await this.prisma.profile.delete({ where: { id: profile.id } });

        purged.push(profile.id);
        this.logger.log(`Purged account ${profile.id}`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'unknown error';

        failed.push({ id: profile.id, reason });
        this.logger.error(`Failed to purge account ${profile.id}: ${reason}`);
      }
    }

    return { due: due.length, purged: purged.length, failed };
  }

  /// Removes the Supabase Auth user. Needs SUPABASE_SECRET_KEY, the same
  /// admin key the role-assignment flow already uses.
  private async deleteAuthUser(userId: string): Promise<void> {
    const supabase = this.config.getOrThrow<AppConfig['supabase']>('supabase');

    if (!supabase.secretKey) {
      throw new Error('SUPABASE_SECRET_KEY is not configured, cannot delete the auth user');
    }

    const response = await fetch(`${supabase.url}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: supabase.secretKey,
        Authorization: `Bearer ${supabase.secretKey}`,
      },
    });

    // A 404 means Supabase Auth has already forgotten this user, which is the
    // state we were aiming for.
    if (!response.ok && response.status !== 404) {
      throw new Error(`Supabase admin deleteUser returned ${response.status}`);
    }
  }

  private purgeCutoffFrom(deletedAt: Date): Date {
    return new Date(deletedAt.getTime() + RESTORE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  }
}
