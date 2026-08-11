import {
  ContentAccent,
  ContentStatus,
  Difficulty,
  PrismaClient,
  QuestionType,
  RoomType,
} from '@prisma/client';
import { legacyRooms, type LegacyRoom } from './seed-data/legacy-rooms';

const prisma = new PrismaClient();

const ROOM_TYPES: Record<LegacyRoom['type'], RoomType> = {
  Walkthrough: RoomType.WALKTHROUGH,
  Challenge: RoomType.CHALLENGE,
  Analysis: RoomType.ANALYSIS,
};

const DIFFICULTIES: Record<LegacyRoom['difficulty'], Difficulty> = {
  'Başlanğıc': Difficulty.BEGINNER,
  'Orta': Difficulty.INTERMEDIATE,
  'Çətin': Difficulty.ADVANCED,
};

const TRANSLITERATION: Record<string, string> = {
  ə: 'e', ı: 'i', ö: 'o', ü: 'u', ğ: 'g', ş: 's', ç: 'c', İ: 'i',
};

function slugify(value: string): string {
  return value
    .toLocaleLowerCase('az')
    .replace(/[əıöüğşçİ]/g, (char) => TRANSLITERATION[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/// The room advertises a single XP figure. Spread it across the questions so a
/// learner who answers everything lands exactly on that number.
function distributePoints(total: number, count: number): number[] {
  if (count === 0) return [];

  const base = Math.floor(total / count);
  const shares = Array.from({ length: count }, () => base);

  for (let i = 0; i < total - base * count; i += 1) {
    shares[i] += 1;
  }

  return shares;
}

async function seedContent(): Promise<void> {
  for (const [roomIndex, legacy] of legacyRooms.entries()) {
    const pathSlug = slugify(legacy.path);
    const moduleSlug = slugify(legacy.module);

    const path = await prisma.path.upsert({
      where: { slug: pathSlug },
      create: {
        slug: pathSlug,
        title: legacy.path,
        description: `${legacy.path} kurikulumu`,
        category: legacy.category,
        status: ContentStatus.PUBLISHED,
        orderIndex: roomIndex,
      },
      update: { status: ContentStatus.PUBLISHED },
    });

    const learningModule = await prisma.learningModule.upsert({
      where: { pathId_slug: { pathId: path.id, slug: moduleSlug } },
      create: {
        pathId: path.id,
        slug: moduleSlug,
        title: legacy.module,
        status: ContentStatus.PUBLISHED,
        orderIndex: 0,
      },
      update: { status: ContentStatus.PUBLISHED },
    });

    const shares = distributePoints(legacy.points, legacy.tasks.length);

    const room = await prisma.room.upsert({
      where: { slug: legacy.slug },
      create: {
        moduleId: learningModule.id,
        slug: legacy.slug,
        title: legacy.title,
        shortTitle: legacy.shortTitle,
        eyebrow: legacy.eyebrow,
        description: legacy.description,
        category: legacy.category,
        type: ROOM_TYPES[legacy.type],
        difficulty: DIFFICULTIES[legacy.difficulty],
        durationLabel: legacy.duration,
        points: legacy.points,
        accent: legacy.accent === 'green' ? ContentAccent.GREEN : ContentAccent.RED,
        objectives: legacy.objectives,
        sourceFile: legacy.sourceFile,
        status: ContentStatus.PUBLISHED,
        orderIndex: roomIndex,
        publishedAt: new Date(),
      },
      update: {
        moduleId: learningModule.id,
        title: legacy.title,
        description: legacy.description,
        objectives: legacy.objectives,
        points: legacy.points,
        status: ContentStatus.PUBLISHED,
      },
    });

    // Tasks are rewritten wholesale; attempts cascade away with them, which is
    // fine because seeding only ever runs against content that has no learners.
    await prisma.task.deleteMany({ where: { roomId: room.id } });

    for (const [taskIndex, legacyTask] of legacy.tasks.entries()) {
      const points = shares[taskIndex] ?? 0;

      await prisma.task.create({
        data: {
          roomId: room.id,
          orderIndex: legacyTask.id,
          title: legacyTask.title,
          durationLabel: legacyTask.duration,
          points,
          sections: legacyTask.sections,
          questions: {
            create: {
              orderIndex: 1,
              type: QuestionType.SINGLE_CHOICE,
              prompt: legacyTask.question.prompt,
              explanation: legacyTask.question.explanation,
              points,
              options: {
                create: legacyTask.question.options.map((label, optionIndex) => ({
                  orderIndex: optionIndex,
                  label,
                  isCorrect: optionIndex === legacyTask.question.correctAnswer,
                })),
              },
            },
          },
        },
      });
    }

    console.log(`Seeded room "${legacy.title}" (${legacy.tasks.length} tasks, ${legacy.points} XP)`);
  }
}

async function seedOrganization(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { slug: 'baki-texniki-kolleci' },
    create: { slug: 'baki-texniki-kolleci', name: 'Bakı Texniki Kolleci' },
    update: {},
  });

  await prisma.classGroup.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: '11A' } },
    create: { organizationId: organization.id, name: '11A', academicYear: '2026/2027' },
    update: {},
  });

  console.log('Seeded demo organization and class 11A');
}

async function main(): Promise<void> {
  await seedOrganization();
  await seedContent();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
