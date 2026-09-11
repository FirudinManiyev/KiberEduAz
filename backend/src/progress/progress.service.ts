import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ContentStatus,
  PointsReason,
  Prisma,
  ProgressStatus,
  QuestionType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { percentOf } from '../catalog/catalog.serializer';
import type { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async submitAnswer(user: AuthenticatedUser, questionId: string, dto: SubmitAnswerDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
        task: { include: { room: { select: { id: true, points: true, status: true } } } },
      },
    });

    if (!question) {
      throw new NotFoundException('Sual tapılmadı');
    }

    if (
      user.profile.role === UserRole.STUDENT &&
      question.task.room.status !== ContentStatus.PUBLISHED
    ) {
      throw new NotFoundException('Sual tapılmadı');
    }

    const isCorrect = this.grade(question, dto);

    return this.prisma.$transaction(async (tx) => {
      // Points are only ever paid out once per question, and the insert is
      // what decides it. A partial unique index on (profile_id, question_id)
      // WHERE is_correct means exactly one correct attempt per learner and
      // question survives, so two concurrent correct submissions cannot both
      // observe "not yet solved" and both pay. skipDuplicates turns the loser
      // into ON CONFLICT DO NOTHING rather than an error that would poison
      // the surrounding transaction.
      const inserted = await tx.answerAttempt.createMany({
        data: {
          profileId: user.id,
          questionId,
          taskId: question.taskId,
          submittedAnswer: this.normalizeAnswer(dto),
          isCorrect,
          pointsAwarded: isCorrect ? question.points : 0,
        },
        skipDuplicates: true,
      });

      // count === 0 means this learner had already solved the question: a
      // normal "already solved" answer, just without a second payout.
      const pointsAwarded = isCorrect && inserted.count > 0 ? question.points : 0;

      if (pointsAwarded > 0) {
        await tx.pointsLedger.create({
          data: {
            profileId: user.id,
            amount: pointsAwarded,
            reason: PointsReason.QUESTION_CORRECT,
            roomId: question.task.roomId,
            taskId: question.taskId,
          },
        });
      }

      const taskState = await this.syncTaskProgress(tx, user.id, question.taskId, question.task.roomId);
      const roomState = await this.syncRoomProgress(tx, user.id, question.task.room);
      const stats = await this.syncStats(tx, user.id, { isCorrect, pointsAwarded });

      return {
        isCorrect,
        pointsAwarded,
        // The answer key stays hidden until the learner has actually solved it.
        explanation: isCorrect ? question.explanation : null,
        correctOptionIds: isCorrect
          ? question.options.filter((option) => option.isCorrect).map((option) => option.id)
          : null,
        task: taskState,
        room: roomState,
        stats: {
          totalPoints: stats.totalPoints,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          correctAnswers: stats.correctAnswers,
          totalAnswers: stats.totalAnswers,
        },
      };
    });
  }

  /// Marks a reading task as done. Some rooms teach through prose and
  /// open-ended reflection prompts that no exact-match grader can score, so the
  /// learner confirms completion themselves. Tasks that carry auto-graded
  /// questions are deliberately excluded: those still have to be answered.
  async completeTask(user: AuthenticatedUser, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        room: { select: { id: true, points: true, status: true } },
        _count: { select: { questions: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task tapılmadı');
    }

    if (user.profile.role === UserRole.STUDENT && task.room.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Task tapılmadı');
    }

    if (task._count.questions > 0) {
      throw new BadRequestException('Bu task sualları cavablandırmaqla tamamlanır');
    }

    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.taskProgress.findUnique({
        where: { profileId_taskId: { profileId: user.id, taskId } },
      });

      const progress = await tx.taskProgress.upsert({
        where: { profileId_taskId: { profileId: user.id, taskId } },
        create: {
          profileId: user.id,
          taskId,
          roomId: task.roomId,
          status: ProgressStatus.COMPLETED,
          pointsEarned: task.points,
          attempts: 1,
          completedAt: new Date(),
        },
        update: {
          status: ProgressStatus.COMPLETED,
          pointsEarned: task.points,
          attempts: { increment: 1 },
          // Keep the original timestamp so re-confirming does not reset it.
          completedAt: previous?.completedAt ?? new Date(),
        },
      });

      // Reading tasks pay out through the room completion bonus rather than a
      // per-task ledger entry, which keeps the advertised room XP exact.
      const roomState = await this.syncRoomProgress(tx, user.id, task.room);
      const stats = await this.syncStats(tx, user.id, {
        isCorrect: false,
        pointsAwarded: roomState.completionBonus,
        countsAsAnswer: false,
      });

      return {
        task: {
          id: taskId,
          completed: progress.status === ProgressStatus.COMPLETED,
          solvedQuestionCount: 0,
          questionCount: 0,
          pointsEarned: progress.pointsEarned,
        },
        room: roomState,
        stats: {
          totalPoints: stats.totalPoints,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          correctAnswers: stats.correctAnswers,
          totalAnswers: stats.totalAnswers,
        },
      };
    });
  }

  private grade(
    question: { type: QuestionType; acceptedAnswers: string[]; options: { id: string; isCorrect: boolean }[] },
    dto: SubmitAnswerDto,
  ): boolean {
    if (question.type === QuestionType.SHORT_ANSWER) {
      if (typeof dto.text !== 'string') {
        throw new BadRequestException('Açıq sual üçün mətn cavabı göndərilməlidir');
      }

      const submitted = normalizeText(dto.text);

      return question.acceptedAnswers.some((accepted) => normalizeText(accepted) === submitted);
    }

    const correctIds = question.options.filter((option) => option.isCorrect).map((o) => o.id);
    const validIds = new Set(question.options.map((option) => option.id));
    const submittedIds = dto.optionIds ?? (dto.optionId ? [dto.optionId] : []);

    if (!submittedIds.length) {
      throw new BadRequestException('Variant seçilməyib');
    }

    if (submittedIds.some((id) => !validIds.has(id))) {
      throw new BadRequestException('Bu sual üçün etibarsız variant');
    }

    const unique = new Set(submittedIds);

    return unique.size === correctIds.length && correctIds.every((id) => unique.has(id));
  }

  private normalizeAnswer(dto: SubmitAnswerDto) {
    if (typeof dto.text === 'string') return { text: dto.text };
    if (dto.optionIds?.length) return { optionIds: dto.optionIds };

    return { optionIds: dto.optionId ? [dto.optionId] : [] };
  }

  private async syncTaskProgress(
    tx: Prisma.TransactionClient,
    profileId: string,
    taskId: string,
    roomId: string,
  ) {
    const questions = await tx.question.findMany({ where: { taskId }, select: { id: true, points: true } });
    const questionIds = questions.map((question) => question.id);

    const solved = await tx.answerAttempt.findMany({
      where: { profileId, questionId: { in: questionIds }, isCorrect: true },
      select: { questionId: true },
      distinct: ['questionId'],
    });

    const completed = questionIds.length > 0 && solved.length === questionIds.length;
    const earned = questions
      .filter((question) => solved.some((row) => row.questionId === question.id))
      .reduce((total, question) => total + question.points, 0);

    const progress = await tx.taskProgress.upsert({
      where: { profileId_taskId: { profileId, taskId } },
      create: {
        profileId,
        taskId,
        roomId,
        status: completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        pointsEarned: earned,
        attempts: 1,
        completedAt: completed ? new Date() : null,
      },
      update: {
        status: completed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        pointsEarned: earned,
        attempts: { increment: 1 },
        completedAt: completed ? new Date() : null,
      },
    });

    return {
      id: taskId,
      completed: progress.status === ProgressStatus.COMPLETED,
      solvedQuestionCount: solved.length,
      questionCount: questionIds.length,
      pointsEarned: progress.pointsEarned,
    };
  }

  private async syncRoomProgress(
    tx: Prisma.TransactionClient,
    profileId: string,
    room: { id: string; points: number },
  ) {
    const taskCount = await tx.task.count({ where: { roomId: room.id } });
    const completedTasks = await tx.taskProgress.count({
      where: { profileId, roomId: room.id, status: ProgressStatus.COMPLETED },
    });

    const questionPoints = await tx.pointsLedger.aggregate({
      where: { profileId, roomId: room.id, reason: PointsReason.QUESTION_CORRECT },
      _sum: { amount: true },
    });

    const justCompleted = taskCount > 0 && completedTasks === taskCount;
    const previous = await tx.roomProgress.findUnique({
      where: { profileId_roomId: { profileId, roomId: room.id } },
    });

    let earned = questionPoints._sum.amount ?? 0;
    let bonus = 0;

    // On first completion, top the learner up to the room's advertised reward.
    // Same idempotency as the answer payout: a partial unique index on
    // (profile_id, room_id) WHERE reason = 'ROOM_COMPLETED' makes the ledger
    // insert the arbiter, so a concurrent second completion pays nothing.
    if (justCompleted && previous?.status !== ProgressStatus.COMPLETED) {
      bonus = Math.max(0, room.points - earned);

      if (bonus > 0) {
        const paid = await tx.pointsLedger.createMany({
          data: {
            profileId,
            amount: bonus,
            reason: PointsReason.ROOM_COMPLETED,
            roomId: room.id,
          },
          skipDuplicates: true,
        });

        if (paid.count === 0) {
          bonus = 0;
        }
      }
    } else if (previous?.status === ProgressStatus.COMPLETED) {
      const roomTotal = await tx.pointsLedger.aggregate({
        where: { profileId, roomId: room.id },
        _sum: { amount: true },
      });

      earned = roomTotal._sum.amount ?? earned;
    }

    const progress = await tx.roomProgress.upsert({
      where: { profileId_roomId: { profileId, roomId: room.id } },
      create: {
        profileId,
        roomId: room.id,
        status: justCompleted ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        completedTaskCount: completedTasks,
        pointsEarned: earned + bonus,
        completedAt: justCompleted ? new Date() : null,
        lastActivityAt: new Date(),
      },
      update: {
        status: justCompleted ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        completedTaskCount: completedTasks,
        pointsEarned: earned + bonus,
        completedAt: justCompleted ? (previous?.completedAt ?? new Date()) : null,
        lastActivityAt: new Date(),
      },
    });

    return {
      id: room.id,
      status: progress.status,
      completed: progress.status === ProgressStatus.COMPLETED,
      completedTaskCount: completedTasks,
      taskCount,
      percent: percentOf(completedTasks, taskCount),
      pointsEarned: progress.pointsEarned,
      completionBonus: bonus,
    };
  }

  private async syncStats(
    tx: Prisma.TransactionClient,
    profileId: string,
    // `countsAsAnswer` keeps accuracy honest: confirming a reading task is not
    // an answer, so it must not land in the correct/total ratio.
    delta: { isCorrect: boolean; pointsAwarded: number; countsAsAnswer?: boolean },
  ) {
    const answerDelta = delta.countsAsAnswer === false ? 0 : 1;
    const current = await tx.userStats.findUnique({ where: { profileId } });
    const today = startOfUtcDay(new Date());
    const streak = nextStreak(current?.lastActiveDate ?? null, current?.currentStreak ?? 0, today);

    const [tasksCompleted, roomsCompleted] = await Promise.all([
      tx.taskProgress.count({ where: { profileId, status: ProgressStatus.COMPLETED } }),
      tx.roomProgress.count({ where: { profileId, status: ProgressStatus.COMPLETED } }),
    ]);

    return tx.userStats.upsert({
      where: { profileId },
      create: {
        profileId,
        totalPoints: delta.pointsAwarded,
        correctAnswers: delta.isCorrect ? 1 : 0,
        totalAnswers: answerDelta,
        tasksCompleted,
        roomsCompleted,
        currentStreak: streak,
        longestStreak: streak,
        lastActiveDate: today,
      },
      update: {
        totalPoints: { increment: delta.pointsAwarded },
        correctAnswers: { increment: delta.isCorrect ? 1 : 0 },
        totalAnswers: { increment: answerDelta },
        tasksCompleted,
        roomsCompleted,
        currentStreak: streak,
        longestStreak: Math.max(streak, current?.longestStreak ?? 0),
        lastActiveDate: today,
      },
    });
  }

  /// Everything the learner dashboard needs in one round trip.
  async summary(user: AuthenticatedUser) {
    const [stats, roomProgress, recentRooms, totalPublishedRooms] = await Promise.all([
      this.prisma.userStats.findUnique({ where: { profileId: user.id } }),
      this.prisma.roomProgress.findMany({ where: { profileId: user.id } }),
      this.prisma.roomProgress.findMany({
        where: { profileId: user.id },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
        include: {
          room: {
            select: {
              id: true,
              slug: true,
              title: true,
              points: true,
              accent: true,
              durationLabel: true,
              module: { select: { title: true } },
              _count: { select: { tasks: true } },
            },
          },
        },
      }),
      this.prisma.room.count({ where: { status: ContentStatus.PUBLISHED } }),
    ]);

    const accuracy =
      stats && stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
        : 0;

    return {
      totalPoints: stats?.totalPoints ?? 0,
      accuracy,
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      roomsCompleted: stats?.roomsCompleted ?? 0,
      tasksCompleted: stats?.tasksCompleted ?? 0,
      roomsInProgress: roomProgress.filter((entry) => entry.status === ProgressStatus.IN_PROGRESS).length,
      totalPublishedRooms,
      rank: rankFor(stats?.totalPoints ?? 0),
      recent: recentRooms.map((entry) => ({
        slug: entry.room.slug,
        title: entry.room.title,
        module: entry.room.module.title,
        accent: entry.room.accent,
        durationLabel: entry.room.durationLabel,
        points: entry.room.points,
        percent: percentOf(entry.completedTaskCount, entry.room._count.tasks),
        status: entry.status,
      })),
    };
  }

  async myRooms(user: AuthenticatedUser) {
    const entries = await this.prisma.roomProgress.findMany({
      where: { profileId: user.id },
      orderBy: { lastActivityAt: 'desc' },
      include: { room: { include: { _count: { select: { tasks: true } } } } },
    });

    return entries.map((entry) => ({
      slug: entry.room.slug,
      title: entry.room.title,
      status: entry.status,
      percent: percentOf(entry.completedTaskCount, entry.room._count.tasks),
      pointsEarned: entry.pointsEarned,
      lastActivityAt: entry.lastActivityAt,
    }));
  }
}

/// Percentage-based ladder, mirroring the ranks described in the concept doc.
const RANKS = [
  { name: 'Yeni Başlayan', min: 0, next: 500 },
  { name: 'Öyrənən', min: 500, next: 2000 },
  { name: 'Bacarıqlı', min: 2000, next: 5000 },
  { name: 'Ekspert', min: 5000, next: 10000 },
  { name: 'Usta', min: 10000, next: null },
] as const;

function rankFor(points: number) {
  const index = RANKS.reduce((found, rank, i) => (points >= rank.min ? i : found), 0);
  const rank = RANKS[index];
  const span = rank.next === null ? 0 : rank.next - rank.min;

  return {
    name: rank.name,
    level: index + 1,
    currentPoints: points,
    nextThreshold: rank.next,
    percent: span === 0 ? 100 : Math.min(100, Math.round(((points - rank.min) / span) * 100)),
  };
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase('az').replace(/\s+/g, ' ');
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextStreak(lastActive: Date | null, currentStreak: number, today: Date): number {
  if (!lastActive) return 1;

  const last = startOfUtcDay(lastActive);
  const dayMs = 24 * 60 * 60 * 1000;
  const gap = Math.round((today.getTime() - last.getTime()) / dayMs);

  if (gap === 0) return Math.max(currentStreak, 1);
  if (gap === 1) return currentStreak + 1;

  return 1;
}
