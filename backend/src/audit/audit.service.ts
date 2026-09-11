import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/// Every privileged action the platform records. Kept as a closed list so a
/// typo cannot silently create a new category nobody queries for.
export type AuditAction =
  | 'teacher.approve'
  | 'teacher.reject'
  | 'profile.role.change'
  | 'room.publish'
  | 'room.unpublish'
  | 'room.archive'
  | 'room.delete'
  | 'path.delete'
  | 'module.delete'
  | 'account.delete.request'
  | 'account.restore'
  | 'account.purge';

export type AuditTargetType = 'profile' | 'room' | 'path' | 'module';

export interface AuditEntry {
  /// Null for the scheduler.
  actorId: string | null;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /// Append one row. Deliberately never throws: losing one line of history is
  /// preferable to blocking the admin action it was recording, and the failure
  /// itself is logged so it is not silent either.
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId ?? null,
          metadata: entry.metadata ?? {},
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit entry ${entry.action} on ${entry.targetType}/${entry.targetId ?? '-'}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /// Newest first, keyset-paged on id so a busy log does not skip or repeat
  /// rows between pages.
  async list(limit: number, cursor?: string) {
    const take = Math.min(Math.max(limit, 1), 200);

    const rows = await this.prisma.auditLog.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { actor: { select: { id: true, fullName: true, email: true } } },
    });

    const page = rows.slice(0, take);

    return {
      entries: page.map((row) => ({
        id: row.id,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        metadata: row.metadata,
        createdAt: row.createdAt,
        actor: row.actor,
      })),
      nextCursor: rows.length > take ? page[page.length - 1].id : null,
    };
  }
}
