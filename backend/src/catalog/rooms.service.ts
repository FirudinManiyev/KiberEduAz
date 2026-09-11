import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountStatus,
  ContentStatus,
  Prisma,
  QuestionType,
  UserRole,
  type TaskProgress,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { toRoomDetailForAuthor, toRoomDetailForLearner, toRoomSummary } from './catalog.serializer';
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
    // Admins see the whole catalog, a teacher every published room plus their
    // own drafts, and a learner only what is published.
    const visibility = this.visibleRoomsFor(user);
    const status = user.profile.role === UserRole.STUDENT ? undefined : query.status;

    const where: Prisma.RoomWhereInput = {
      ...(status ? { status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      // AND-composed so the visibility scope cannot be shadowed by the search OR.
      AND: [
        visibility,
        ...(query.search
          ? [
              {
                OR: [
                  { title: { contains: query.search, mode: 'insensitive' as const } },
                  { shortTitle: { contains: query.search, mode: 'insensitive' as const } },
                  { description: { contains: query.search, mode: 'insensitive' as const } },
                  { module: { title: { contains: query.search, mode: 'insensitive' as const } } },
                  {
                    module: {
                      path: { title: { contains: query.search, mode: 'insensitive' as const } },
                    },
                  },
                ],
              },
            ]
          : []),
      ],
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

    // Same visibility rule as list(): a draft is only reachable by its author
    // or an admin, so knowing a slug is not a way around the listing scope.
    if (!this.canView(user, room)) {
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

    return toRoomDetailForLearner(room, roomProgress, taskProgressMap, answers);
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

  /// Serves the answer key, so the caller must own the room (or be an admin).
  async findByIdForAuthor(user: AuthenticatedUser, id: string) {
    await this.assertCanManageRoom(user, id);

    const room = await this.prisma.room.findUnique({ where: { id }, include: CONTENT_INCLUDE });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    return toRoomDetailForAuthor(room);
  }

  async create(user: AuthenticatedUser, dto: UpsertRoomDto) {
    await this.assertCanAttachToModule(user, dto.moduleId);

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

    return toRoomDetailForAuthor(room);
  }

  async update(user: AuthenticatedUser, id: string, dto: Partial<UpsertRoomDto>) {
    await this.assertCanManageRoom(user, id);

    if (dto.moduleId) {
      await this.assertCanAttachToModule(user, dto.moduleId);
    }

    const safeDto =
      user.profile.role === UserRole.ADMIN ? dto : { ...dto, status: undefined };

    const room = await this.prisma.room.update({
      where: { id },
      data: this.roomData(safeDto),
      include: CONTENT_INCLUDE,
    });

    return toRoomDetailForAuthor(room);
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

    return toRoomDetailForAuthor(room);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.room.delete({ where: { id } });
  }

  async upsertTask(
    user: AuthenticatedUser,
    roomId: string,
    dto: UpsertTaskDto,
    taskId?: string,
  ) {
    await this.assertCanManageRoom(user, roomId);

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, _count: { select: { tasks: true } } },
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    // A task id in the URL must hang off the room id in the URL, otherwise an
    // owned room becomes a handle on somebody else’s tasks.
    if (taskId) {
      await this.assertTaskBelongsToRoom(roomId, taskId);
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

  async removeTask(user: AuthenticatedUser, roomId: string, taskId: string): Promise<void> {
    await this.assertCanManageRoom(user, roomId);

    // Scoped to the room, so a mismatched nesting can never delete.
    const { count } = await this.prisma.task.deleteMany({ where: { id: taskId, roomId } });

    if (count === 0) {
      throw new NotFoundException('Task tapılmadı');
    }
  }

  /// Admins manage the whole catalog; a teacher only the rooms they authored.
  /// Mirrors ClassesService.assertCanManage.
  private async assertCanManageRoom(user: AuthenticatedUser, roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, createdById: true },
    });

    if (!room) {
      throw new NotFoundException('Room tapılmadı');
    }

    if (user.profile.role === UserRole.ADMIN) {
      return room;
    }

    if (
      user.profile.role !== UserRole.TEACHER ||
      user.profile.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException('Bu otağı idarə etmək üçün icazən yoxdur');
    }

    if (room.createdById !== user.id) {
      throw new ForbiddenException('Bu otaq sənə aid deyil');
    }

    return room;
  }

  private async assertTaskBelongsToRoom(roomId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { roomId: true },
    });

    if (!task || task.roomId !== roomId) {
      throw new NotFoundException('Task tapılmadı');
    }
  }

  private visibleRoomsFor(user: AuthenticatedUser): Prisma.RoomWhereInput {
    if (user.profile.role === UserRole.ADMIN) return {};

    if (user.profile.role === UserRole.TEACHER) {
      return { OR: [{ status: ContentStatus.PUBLISHED }, { createdById: user.id }] };
    }

    return { status: ContentStatus.PUBLISHED };
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

  /// A teacher can put a room into any published module, or into a draft they
  /// authored themselves - not into somebody else's unreviewed draft.
  private async assertCanAttachToModule(user: AuthenticatedUser, moduleId: string): Promise<void> {
    const found = await this.prisma.learningModule.findUnique({
      where: { id: moduleId },
      select: { status: true, createdById: true },
    });

    if (!found) {
      throw new NotFoundException('Modul tapılmadı');
    }

    if (user.profile.role === UserRole.ADMIN) return;

    if (found.status !== ContentStatus.PUBLISHED && found.createdById !== user.id) {
      throw new ForbiddenException('Bu modula room əlavə etmək üçün icazən yoxdur');
    }
  }

  private canView(
    user: AuthenticatedUser,
    room: { status: ContentStatus; createdById: string | null },
  ): boolean {
    if (user.profile.role === UserRole.ADMIN) return true;
    if (room.status === ContentStatus.PUBLISHED) return true;

    return user.profile.role === UserRole.TEACHER && room.createdById === user.id;
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
