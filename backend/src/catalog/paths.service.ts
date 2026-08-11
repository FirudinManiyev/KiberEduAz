import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { percentOf } from './catalog.serializer';
import type { UpsertModuleDto, UpsertPathDto } from './dto/content.dto';

@Injectable()
export class PathsService {
  constructor(private readonly prisma: PrismaService) {}

  /// The full Path -> Module -> Room tree, annotated with the caller's progress.
  async tree(user: AuthenticatedUser) {
    const studentsOnly = user.profile.role === UserRole.STUDENT;
    const publishedOnly = studentsOnly ? { status: ContentStatus.PUBLISHED } : {};

    const [paths, progress] = await Promise.all([
      this.prisma.path.findMany({
        where: publishedOnly,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          modules: {
            where: publishedOnly,
            orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
            include: {
              rooms: {
                where: publishedOnly,
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
      data: { ...this.pathData(dto), createdById: user.id },
    });
  }

  async updatePath(id: string, dto: Partial<UpsertPathDto>) {
    return this.prisma.path.update({ where: { id }, data: this.pathData(dto) });
  }

  async removePath(id: string): Promise<void> {
    await this.prisma.path.delete({ where: { id } });
  }

  async createModule(dto: UpsertModuleDto) {
    await this.assertPathExists(dto.pathId);

    return this.prisma.learningModule.create({ data: this.moduleData(dto) });
  }

  async updateModule(id: string, dto: Partial<UpsertModuleDto>) {
    if (dto.pathId) {
      await this.assertPathExists(dto.pathId);
    }

    return this.prisma.learningModule.update({ where: { id }, data: this.moduleData(dto) });
  }

  async removeModule(id: string): Promise<void> {
    await this.prisma.learningModule.delete({ where: { id } });
  }

  private async assertPathExists(pathId: string): Promise<void> {
    const found = await this.prisma.path.findUnique({ where: { id: pathId }, select: { id: true } });

    if (!found) {
      throw new NotFoundException('Path tapılmadı');
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
