import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ContentStatus,
  Prisma,
  QuestionType,
  UserRole,
  type TaskProgress,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  toRoomDetailForAuthor,
  toRoomDetailForLearner,
  toRoomSummary,
  type RoomWithContent,
} from './catalog.serializer';
import type { RoomQueryDto, UpsertQuestionDto, UpsertRoomDto, UpsertTaskDto } from './dto/content.dto';

const CONTENT_INCLUDE = {
  module: {
    select: {
      id: true,
      slug: true,
      title: true,
      path: { select: { id: true, slug: true, title: true } },
    },
  },
  tasks: {
    orderBy: { orderIndex: 'asc' },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  },
} satisfies Prisma.RoomInclude;

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthenticatedUser, query: RoomQueryDto) {
    const canSeeDrafts = user.profile.role !== UserRole.STUDENT;
    const status = canSeeDrafts ? query.status : ContentStatus.PUBLISHED;

    const where: Prisma.RoomWhereInput = {
      ...(status ? { status } : canSeeDrafts ? {} : { status: ContentStatus.PUBLISHED }),
      ...(query.category ? { category: query.category } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { shortTitle: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { module: { title: { contains: query.search, mode: 'insensitive' } } },
              { module: { path: { title: { contains: query.search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [rooms, progress] = await Promise.all([
      this.prisma.room.findMany({
        where,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          module: { select: { title: true, path: { select: { title: true } } } },
          _count: { select: { tasks: true } },
        },
      }),
      this.prisma.roomProgress.findMany({ where: { profileId: user.id } }),
    ]);

    const progressByRoom = new Map(progress.map((entry) => [entry.roomId, entry]));

    return rooms.map((room) => toRoomSummary(room, progressByRoom.get(room.id)));
  }

  async findBySlug(user: AuthenticatedUser, slug: string) {
    const room = await this.prisma.room.findUnique({
      where: { slug },
      include: CONTENT_INCLUDE,
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    const isStudent = user.profile.role === UserRole.STUDENT;

    if (isStudent && room.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Room tapılmadı');
    }

    const questionIds = room.tasks.flatMap((task) => task.questions.map((q) => q.id));

    const [roomProgress, taskProgress, attempted] = await Promise.all([
      this.prisma.roomProgress.findUnique({
        where: { profileId_roomId: { profileId: user.id, roomId: room.id } },
      }),
      this.prisma.taskProgress.findMany({ where: { profileId: user.id, roomId: room.id } }),
      this.attemptedQuestionIds(user.id, questionIds),
    ]);

    const solved = await this.solvedQuestionIds(user.id, questionIds);

    const answers = new Map(
      [...attempted].map((questionId) => [
        questionId,
        { answered: true, isCorrect: solved.has(questionId) },
      ]),
    );

    const taskProgressMap = new Map<string, TaskProgress>(
      taskProgress.map((entry) => [entry.taskId, entry]),
    );

    return toRoomDetailForLearner(room as RoomWithContent, roomProgress, taskProgressMap, answers);
  }

  private async solvedQuestionIds(profileId: string, questionIds: string[]): Promise<Set<string>> {
    return this.distinctQuestionIds(profileId, questionIds, true);
  }

  private async attemptedQuestionIds(profileId: string, questionIds: string[]): Promise<Set<string>> {
    return this.distinctQuestionIds(profileId, questionIds);
  }

  private async distinctQuestionIds(
    profileId: string,
    questionIds: string[],
    isCorrect?: boolean,
  ): Promise<Set<string>> {
    if (!questionIds.length) return new Set();

    const rows = await this.prisma.answerAttempt.findMany({
      where: {
        profileId,
        questionId: { in: questionIds },
        ...(isCorrect === undefined ? {} : { isCorrect }),
      },
      select: { questionId: true },
      distinct: ['questionId'],
    });

    return new Set(rows.map((row) => row.questionId));
  }

  async findByIdForAuthor(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id }, include: CONTENT_INCLUDE });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    return toRoomDetailForAuthor(room as RoomWithContent);
  }

  async create(user: AuthenticatedUser, dto: UpsertRoomDto) {
    await this.assertModuleExists(dto.moduleId);

    // Teachers always create drafts; only an admin can publish later.
    const status =
      user.profile.role === UserRole.ADMIN
        ? (dto.status ?? ContentStatus.DRAFT)
        : ContentStatus.DRAFT;

    const room = await this.prisma.room.create({
      data: {
        ...this.roomData({ ...dto, status }),
        moduleId: dto.moduleId,
        slug: dto.slug,
        title: dto.title,
        createdById: user.id,
      },
      include: CONTENT_INCLUDE,
    });

    return toRoomDetailForAuthor(room as RoomWithContent);
  }

  async update(user: AuthenticatedUser, id: string, dto: Partial<UpsertRoomDto>) {
    if (dto.moduleId) {
      await this.assertModuleExists(dto.moduleId);
    }

    const safeDto =
      user.profile.role === UserRole.ADMIN ? dto : { ...dto, status: undefined };

    const room = await this.prisma.room.update({
      where: { id },
      data: this.roomData(safeDto),
      include: CONTENT_INCLUDE,
    });

    return toRoomDetailForAuthor(room as RoomWithContent);
  }

  async setStatus(id: string, status: ContentStatus) {
    const room = await this.prisma.room.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
      },
      include: CONTENT_INCLUDE,
    });

    return toRoomDetailForAuthor(room as RoomWithContent);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }

  async upsertTask(roomId: string, dto: UpsertTaskDto, taskId?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, _count: { select: { tasks: true } } },
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    const orderIndex = dto.orderIndex ?? room._count.tasks + 1;
    const sections = (dto.sections ?? []) as unknown as Prisma.InputJsonValue;

    return this.prisma.$transaction(async (tx) => {
      const task = taskId
        ? await tx.task.update({
            where: { id: taskId },
            data: {
              title: dto.title,
              durationLabel: dto.durationLabel,
              points: dto.points,
              orderIndex,
              sections,
            },
          })
        : await tx.task.create({
            data: {
              roomId,
              title: dto.title,
              durationLabel: dto.durationLabel ?? '',
              points: dto.points ?? 0,
              orderIndex,
              sections,
            },
          });

      if (dto.questions) {
        // Questions are replaced wholesale so the editor can reorder freely.
        await tx.question.deleteMany({ where: { taskId: task.id } });

        for (const [index, question] of dto.questions.entries()) {
          await this.createQuestion(tx, task.id, question, index + 1);
        }
      }

      return task;
    });
  }

  async removeTask(taskId: string): Promise<void> {
    await this.prisma.task.delete({ where: { id: taskId } });
  }

  private async createQuestion(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: UpsertQuestionDto,
    orderIndex: number,
  ) {
    const type = dto.type ?? QuestionType.SINGLE_CHOICE;
    const options = dto.options ?? [];

    if (type === QuestionType.SHORT_ANSWER) {
      if (!dto.acceptedAnswers?.length) {
        throw new BadRequestException('Açıq sual üçün ən azı bir qəbul edilən cavab lazımdır');
      }
    } else {
      if (options.length < 2) {
        throw new BadRequestException('Variantlı sual üçün ən azı iki variant lazımdır');
      }

      if (!options.some((option) => option.isCorrect)) {
        throw new BadRequestException('Ən azı bir variant düzgün olmalıdır');
      }

      if (type === QuestionType.SINGLE_CHOICE && options.filter((o) => o.isCorrect).length > 1) {
        throw new BadRequestException('Tək seçimli sualda yalnız bir düzgün variant ola bilər');
      }
    }

    return tx.question.create({
      data: {
        taskId,
        orderIndex: dto.orderIndex ?? orderIndex,
        type,
        prompt: dto.prompt,
        explanation: dto.explanation ?? '',
        points: dto.points ?? 0,
        acceptedAnswers: dto.acceptedAnswers ?? [],
        options: {
          create: options.map((option, index) => ({
            orderIndex: index,
            label: option.label,
            isCorrect: option.isCorrect,
          })),
        },
      },
    });
  }

  private async assertModuleExists(moduleId: string): Promise<void> {
    const found = await this.prisma.learningModule.findUnique({
      where: { id: moduleId },
      select: { id: true },
    });

    if (!found) {
      throw new NotFoundException('Modul tapılmadı');
    }
  }

  private roomData(dto: Partial<UpsertRoomDto>) {
    return {
      moduleId: dto.moduleId,
      slug: dto.slug,
      title: dto.title,
      shortTitle: dto.shortTitle,
      eyebrow: dto.eyebrow,
      description: dto.description,
      category: dto.category,
      type: dto.type,
      difficulty: dto.difficulty,
      durationLabel: dto.durationLabel,
      points: dto.points,
      accent: dto.accent,
      objectives: dto.objectives,
      sourceFile: dto.sourceFile,
      status: dto.status,
      orderIndex: dto.orderIndex,
    };
  }
}
