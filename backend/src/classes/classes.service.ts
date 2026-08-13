import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import type { AddStudentByEmailDto, CreateClassDto } from './dto/classes.dto';

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profilesService: ProfilesService,
  ) {}

  async listForUser(user: AuthenticatedUser) {
    if (user.profile.role === UserRole.ADMIN) {
      return this.prisma.classGroup.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          organization: { select: { id: true, name: true } },
          teacher: { select: { id: true, fullName: true, email: true } },
          _count: { select: { memberships: true } },
        },
      });
    }

    return this.prisma.classGroup.findMany({
      where: { teacherId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true, email: true } },
        _count: { select: { memberships: true } },
      },
    });
  }

  async create(user: AuthenticatedUser, dto: CreateClassDto) {
    this.assertActiveTeacherOrAdmin(user);

    let organizationId = user.profile.organizationId;

    if (!organizationId) {
      const org = await this.profilesService.ensureDefaultOrganization();
      organizationId = org.id;
      await this.prisma.profile.update({
        where: { id: user.id },
        data: { organizationId },
      });
    }

    try {
      return await this.prisma.classGroup.create({
        data: {
          organizationId,
          teacherId: user.profile.role === UserRole.TEACHER ? user.id : user.id,
          name: dto.name.trim(),
          academicYear: dto.academicYear?.trim(),
        },
        include: {
          organization: { select: { id: true, name: true } },
          _count: { select: { memberships: true } },
        },
      });
    } catch {
      throw new ConflictException('Bu adlı sinif artıq mövcuddur');
    }
  }

  async detail(user: AuthenticatedUser, classId: string) {
    const group = await this.prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        organization: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true, email: true } },
        memberships: {
          orderBy: { joinedAt: 'desc' },
          include: {
            profile: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                stats: { select: { totalPoints: true, roomsCompleted: true } },
              },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundException('Sinif tapılmadı');
    this.assertCanManage(user, group.teacherId);

    return {
      id: group.id,
      name: group.name,
      academicYear: group.academicYear,
      organization: group.organization,
      teacher: group.teacher,
      students: group.memberships.map((membership) => ({
        membershipId: membership.id,
        joinedAt: membership.joinedAt,
        ...membership.profile,
      })),
    };
  }

  async addStudentByEmail(user: AuthenticatedUser, classId: string, dto: AddStudentByEmailDto) {
    const group = await this.prisma.classGroup.findUnique({ where: { id: classId } });

    if (!group) throw new NotFoundException('Sinif tapılmadı');
    this.assertCanManage(user, group.teacherId);

    const email = dto.email.trim().toLowerCase();
    const student = await this.prisma.profile.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!student) {
      throw new NotFoundException('Bu e-poçtla qeydiyyatdan keçmiş şagird tapılmadı');
    }

    if (student.role !== UserRole.STUDENT) {
      throw new BadRequestException('Yalnız şagird hesablarını sinfə əlavə etmək olar');
    }

    try {
      await this.prisma.classMembership.create({
        data: { classGroupId: classId, profileId: student.id },
      });
    } catch {
      throw new ConflictException('Şagird artıq bu sinifdədir');
    }

    if (!student.organizationId && group.organizationId) {
      await this.prisma.profile.update({
        where: { id: student.id },
        data: { organizationId: group.organizationId, classLabel: group.name },
      });
    }

    return this.detail(user, classId);
  }

  async removeStudent(user: AuthenticatedUser, classId: string, profileId: string) {
    const group = await this.prisma.classGroup.findUnique({ where: { id: classId } });

    if (!group) throw new NotFoundException('Sinif tapılmadı');
    this.assertCanManage(user, group.teacherId);

    await this.prisma.classMembership.deleteMany({
      where: { classGroupId: classId, profileId },
    });

    return this.detail(user, classId);
  }

  private assertActiveTeacherOrAdmin(user: AuthenticatedUser) {
    if (user.profile.role === UserRole.ADMIN) return;

    if (
      user.profile.role !== UserRole.TEACHER ||
      user.profile.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException('Yalnız təsdiqlənmiş müəllimlər sinif yarada bilər');
    }
  }

  private assertCanManage(user: AuthenticatedUser, teacherId: string | null) {
    if (user.profile.role === UserRole.ADMIN) return;

    if (user.profile.role !== UserRole.TEACHER || user.profile.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Bu sinifi idarə etmək üçün icazən yoxdur');
    }

    if (teacherId !== user.id) {
      throw new ForbiddenException('Bu sinif sənə aid deyil');
    }
  }
}
