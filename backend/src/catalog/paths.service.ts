import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, ContentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { percentOf } from './catalog.serializer';
import type { UpsertModuleDto, UpsertPathDto } from './dto/content.dto';

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  /// The full Path -> Module -> Room tree, annotated with the caller's progress.
  async tree(user: AuthenticatedUser) {
    // Admins see everything, a learner only what is published, and a teacher
    // what is published plus their own drafts at every level - the same rule
    // RoomsService.list applies, so the tree cannot leak what the list hides.
    const visible = this.visibleFor(user);

    const [paths, progress] = await Promise.all([
      this.prisma.path.findMany({
        where: visible,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          modules: {
            where: visible,
            orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
            include: {
              rooms: {
                where: visible,
                orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
                include: { _count: { select: { tasks: true } } },
              },
            },
          },
        },
      }),
      this.prisma.roomProgress.findMany({ where: { profileId: user.id } }),
    ]);

    const progressByRoom = new Map(progress.map((entry) => [entry.roomId, entry]));

    return paths.map((path) => ({
      id: path.id,
      slug: path.slug,
      title: path.title,
      description: path.description,
      intro: path.intro,
      imageUrl: path.imageUrl,
      category: path.category,
      status: path.status,
      modules: path.modules.map((module) => ({
        id: module.id,
        slug: module.slug,
        title: module.title,
        description: module.description,
        status: module.status,
        rooms: module.rooms.map((room) => {
          const roomProgress = progressByRoom.get(room.id);

          return {
            id: room.id,
            slug: room.slug,
            title: room.title,
            shortTitle: room.shortTitle,
            type: room.type,
            difficulty: room.difficulty,
            durationLabel: room.durationLabel,
            points: room.points,
            accent: room.accent,
            status: room.status,
            taskCount: room._count.tasks,
            percent: percentOf(roomProgress?.completedTaskCount ?? 0, room._count.tasks),
          };
        }),
      })),
    }));
  }

  async createPath(user: AuthenticatedUser, dto: UpsertPathDto) {
    return this.prisma.path.create({
      data: { ...this.pathData(this.withSafeStatus(user, dto)), createdById: user.id },
    });
  }

  async updatePath(user: AuthenticatedUser, id: string, dto: Partial<UpsertPathDto>) {
    await this.assertCanManagePath(user, id);

    return this.prisma.path.update({
      where: { id },
      data: this.pathData(this.withSafeStatus(user, dto)),
    });
  }

  async removePath(id: string): Promise<void> {
    await this.prisma.path.delete({ where: { id } });
  }

  async createModule(user: AuthenticatedUser, dto: UpsertModuleDto) {
    // A teacher may only hang a module off a path they own.
    await this.assertCanManagePath(user, dto.pathId);

    return this.prisma.learningModule.create({
      data: { ...this.moduleData(this.withSafeStatus(user, dto)), createdById: user.id },
    });
  }

  async updateModule(user: AuthenticatedUser, id: string, dto: Partial<UpsertModuleDto>) {
    await this.assertCanManageModule(user, id);

    if (dto.pathId) {
      // Re-parenting is a write to the destination path too.
      await this.assertCanManagePath(user, dto.pathId);
    }

    return this.prisma.learningModule.update({
      where: { id },
      data: this.moduleData(this.withSafeStatus(user, dto)),
    });
  }

  async removeModule(id: string): Promise<void> {
    await this.prisma.learningModule.delete({ where: { id } });
  }

  private visibleFor(user: AuthenticatedUser): {
    OR?: { status?: ContentStatus; createdById?: string }[];
    status?: ContentStatus;
  } {
    if (user.profile.role === UserRole.ADMIN) return {};

    if (user.profile.role === UserRole.TEACHER) {
      return { OR: [{ status: ContentStatus.PUBLISHED }, { createdById: user.id }] };
    }

    return { status: ContentStatus.PUBLISHED };
  }

  /// Publishing is an admin decision. Teachers draft; `status` is stripped from
  /// their payloads so PATCH can never stand in for the publish endpoint.
  private withSafeStatus<T extends { status?: ContentStatus }>(
    user: AuthenticatedUser,
    dto: T,
  ): T {
    if (user.profile.role === UserRole.ADMIN) return dto;

    return { ...dto, status: undefined };
  }

  /// Admins manage the whole curriculum; a teacher only what they authored.
  /// Mirrors ClassesService.assertCanManage. Rows predating the ownership
  /// column carry createdById = null and stay admin-only.
  private async assertCanManagePath(user: AuthenticatedUser, pathId: string): Promise<void> {
    const path = await this.prisma.path.findUnique({
      where: { id: pathId },
      select: { createdById: true },
    });

    if (!path) {
      throw new NotFoundException('Path tapılmadı');
    }

    if (user.profile.role === UserRole.ADMIN) return;

    this.assertActiveTeacher(user, 'Bu path-i idarə etmək üçün icazən yoxdur');

    if (path.createdById !== user.id) {
      throw new ForbiddenException('Bu path sənə aid deyil');
    }
  }

  private async assertCanManageModule(user: AuthenticatedUser, moduleId: string): Promise<void> {
    const module = await this.prisma.learningModule.findUnique({
      where: { id: moduleId },
      select: { createdById: true },
    });

    if (!module) {
      throw new NotFoundException('Modul tapılmadı');
    }

    if (user.profile.role === UserRole.ADMIN) return;

    this.assertActiveTeacher(user, 'Bu modulu idarə etmək üçün icazən yoxdur');

    if (module.createdById !== user.id) {
      throw new ForbiddenException('Bu modul sənə aid deyil');
    }
  }

  private assertActiveTeacher(user: AuthenticatedUser, message: string): void {
    if (
      user.profile.role !== UserRole.TEACHER ||
      user.profile.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException(message);
    }
  }

  private pathData(dto: Partial<UpsertPathDto>): Prisma.PathUncheckedUpdateInput &
    Prisma.PathUncheckedCreateInput {
    return {
      slug: dto.slug as string,
      title: dto.title as string,
      description: dto.description,
      intro: dto.intro,
      imageUrl: dto.imageUrl,
      category: dto.category,
      status: dto.status,
      orderIndex: dto.orderIndex,
    };
  }

  private moduleData(dto: Partial<UpsertModuleDto>): Prisma.LearningModuleUncheckedUpdateInput &
    Prisma.LearningModuleUncheckedCreateInput {
    return {
      pathId: dto.pathId as string,
      slug: dto.slug as string,
      title: dto.title as string,
      description: dto.description,
      status: dto.status,
      orderIndex: dto.orderIndex,
    };
  }
}
