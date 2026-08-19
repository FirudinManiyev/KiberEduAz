import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ContentAccent,
  ContentStatus,
  Difficulty,
  PrismaClient,
  RoomType,
} from '@prisma/client';
import { holbertonRooms, type HolbertonRoom } from './seed-data/holberton-rooms';

const prisma = new PrismaClient();
const CONTENT_DIR = path.join(__dirname, 'seed-data', 'holberton');

interface ParsedTask {
  orderIndex: number;
  title: string;
  markdown: string;
}

/// Splits a room document into its `## Task N — Title` sections. Everything
/// before the first task (the intro blurb and learning outcomes) already lives
/// on the room record, so only task bodies are kept.
function parseTasks(source: string, slug: string): ParsedTask[] {
  const normalized = source.replace(/\r\n/g, '\n');
  const pattern = /^##\s+Task\s+(\d+)\s*[—–-]?\s*(.*)$/gm;
  const headings: { order: number; title: string; start: number; bodyStart: number }[] = [];

  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    headings.push({
      order: Number(match[1]),
      title: match[2].trim(),
      start: match.index,
      bodyStart: match.index + match[0].length,
    });
  }

  if (headings.length === 0) {
    throw new Error(`No "## Task N" headings found in ${slug}`);
  }

  return headings.map((heading, index) => {
    const end = headings[index + 1]?.start ?? normalized.length;
    const markdown = normalized.slice(heading.bodyStart, end).trim();

    if (!markdown) {
      throw new Error(`Task ${heading.order} of ${slug} is empty`);
    }

    return {
      orderIndex: heading.order,
      title: heading.title || `Task ${heading.order}`,
      markdown,
    };
  });
}

/// Spread the room's advertised XP across its tasks so a learner who finishes
/// every task lands exactly on the number shown in the catalogue.
function distributePoints(total: number, count: number): number[] {
  if (count === 0) return [];

  const base = Math.floor(total / count);
  const shares = Array.from({ length: count }, () => base);

  for (let i = 0; i < total - base * count; i += 1) {
    shares[i] += 1;
  }

  return shares;
}

async function seedRoom(room: HolbertonRoom, pathOrder: number): Promise<number> {
  const source = await readFile(path.join(CONTENT_DIR, room.sourceFile), 'utf8');
  const tasks = parseTasks(source, room.slug);

  const learningPath = await prisma.path.upsert({
    where: { slug: room.pathSlug },
    create: {
      slug: room.pathSlug,
      title: room.pathTitle,
      description: `${room.pathTitle} kurikulumu`,
      category: room.category,
      status: ContentStatus.PUBLISHED,
      orderIndex: pathOrder,
    },
    update: { title: room.pathTitle, status: ContentStatus.PUBLISHED },
  });

  const learningModule = await prisma.learningModule.upsert({
    where: { pathId_slug: { pathId: learningPath.id, slug: room.moduleSlug } },
    create: {
      pathId: learningPath.id,
      slug: room.moduleSlug,
      title: room.moduleTitle,
      status: ContentStatus.PUBLISHED,
      orderIndex: 0,
    },
    update: { title: room.moduleTitle, status: ContentStatus.PUBLISHED },
  });

  const record = await prisma.room.upsert({
    where: { slug: room.slug },
    create: {
      moduleId: learningModule.id,
      slug: room.slug,
      title: room.title,
      shortTitle: room.shortTitle,
      eyebrow: room.eyebrow,
      description: room.description,
      category: room.category,
      type: RoomType[room.type],
      difficulty: Difficulty[room.difficulty],
      durationLabel: room.durationLabel,
      points: room.points,
      accent: ContentAccent[room.accent],
      objectives: [...room.objectives],
      sourceFile: room.sourceFile,
      status: ContentStatus.PUBLISHED,
      orderIndex: room.orderIndex,
      publishedAt: new Date(),
    },
    update: {
      moduleId: learningModule.id,
      title: room.title,
      shortTitle: room.shortTitle,
      eyebrow: room.eyebrow,
      description: room.description,
      category: room.category,
      type: RoomType[room.type],
      difficulty: Difficulty[room.difficulty],
      durationLabel: room.durationLabel,
      points: room.points,
      accent: ContentAccent[room.accent],
      objectives: [...room.objectives],
      sourceFile: room.sourceFile,
      status: ContentStatus.PUBLISHED,
      orderIndex: room.orderIndex,
    },
  });

  const shares = distributePoints(room.points, tasks.length);

  // Tasks are rewritten wholesale so re-running picks up content edits. Learner
  // attempts cascade with them, so only re-seed content nobody is mid-way through.
  await prisma.task.deleteMany({ where: { roomId: record.id } });

  for (const [index, task] of tasks.entries()) {
    await prisma.task.create({
      data: {
        roomId: record.id,
        orderIndex: task.orderIndex,
        title: task.title,
        durationLabel: '10 dəq',
        points: shares[index] ?? 0,
        // A single markdown section keeps tables, code blocks and callouts intact.
        sections: [{ body: task.markdown }],
      },
    });
  }

  return tasks.length;
}

/// Parses every room without touching the database, so content problems surface
/// before anything is written. Run with `--dry-run`.
async function dryRun(): Promise<void> {
  let totalTasks = 0;

  for (const room of holbertonRooms) {
    const source = await readFile(path.join(CONTENT_DIR, room.sourceFile), 'utf8');
    const tasks = parseTasks(source, room.slug);
    const leaks = tasks.filter(
      (task) => /CƏVAB AÇARI/i.test(task.markdown) || /^##\s+Yekun Yoxlama/im.test(task.markdown),
    );

    if (leaks.length > 0) {
      throw new Error(`${room.slug}: answer key leaked into ${leaks.length} task(s)`);
    }

    totalTasks += tasks.length;
    console.log(
      `${room.slug}: ${tasks.length} tasks, ${room.points} XP, shortest ${Math.min(
        ...tasks.map((task) => task.markdown.length),
      )} chars`,
    );
  }

  console.log(`\nDry run OK: ${holbertonRooms.length} rooms, ${totalTasks} tasks, no answer keys.`);
}

async function main(): Promise<void> {
  if (process.argv.includes('--dry-run')) {
    await dryRun();
    return;
  }

  const pathOrder = new Map<string, number>();

  for (const room of holbertonRooms) {
    if (!pathOrder.has(room.pathSlug)) pathOrder.set(room.pathSlug, pathOrder.size);
  }

  let totalTasks = 0;

  for (const room of holbertonRooms) {
    const taskCount = await seedRoom(room, pathOrder.get(room.pathSlug) ?? 0);
    totalTasks += taskCount;
    console.log(`Seeded ${room.slug} (${taskCount} tasks, ${room.points} XP)`);
  }

  console.log(`\nDone: ${holbertonRooms.length} rooms, ${totalTasks} tasks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
