import type {
  Prisma,
  Question,
  QuestionOption,
  Room,
  RoomProgress,
  Task,
  TaskProgress,
} from '@prisma/client';

export type RoomWithContent = Room & {
  module: { id: string; slug: string; title: string; path: { id: string; slug: string; title: string } };
  tasks: (Task & { questions: (Question & { options: QuestionOption[] })[] })[];
};

export type RoomWithModule = Room & {
  module: { title: string; path: { title: string } };
  _count?: { tasks: number };
};

export interface LessonSection {
  heading?: string;
  body: string;
  bullets?: string[];
}

export function readSections(value: Prisma.JsonValue): LessonSection[] {
  return Array.isArray(value) ? (value as unknown as LessonSection[]) : [];
}

export function toRoomSummary(room: RoomWithModule, progress?: RoomProgress | null) {
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    shortTitle: room.shortTitle,
    eyebrow: room.eyebrow,
    description: room.description,
    category: room.category,
    type: room.type,
    difficulty: room.difficulty,
    durationLabel: room.durationLabel,
    points: room.points,
    accent: room.accent,
    objectives: room.objectives,
    status: room.status,
    path: room.module.path.title,
    module: room.module.title,
    taskCount: room._count?.tasks ?? 0,
    progress: progress
      ? {
          status: progress.status,
          percent: percentOf(progress.completedTaskCount, room._count?.tasks ?? 0),
          completedTaskCount: progress.completedTaskCount,
          pointsEarned: progress.pointsEarned,
        }
      : { status: null, percent: 0, completedTaskCount: 0, pointsEarned: 0 },
  };
}

interface AnswerState {
  answered: boolean;
  isCorrect: boolean;
}

/// Student-facing view. `isCorrect` flags, `explanation` and `acceptedAnswers`
/// are withheld until the learner has actually solved the question, so the
/// answer key never reaches the browser.
export function toRoomDetailForLearner(
  room: RoomWithContent,
  roomProgress: RoomProgress | null,
  taskProgress: Map<string, TaskProgress>,
  answers: Map<string, AnswerState>,
) {
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    shortTitle: room.shortTitle,
    eyebrow: room.eyebrow,
    description: room.description,
    category: room.category,
    type: room.type,
    difficulty: room.difficulty,
    durationLabel: room.durationLabel,
    points: room.points,
    accent: room.accent,
    objectives: room.objectives,
    sourceFile: room.sourceFile,
    path: { id: room.module.path.id, slug: room.module.path.slug, title: room.module.path.title },
    module: { id: room.module.id, slug: room.module.slug, title: room.module.title },
    progress: {
      status: roomProgress?.status ?? null,
      percent: percentOf(roomProgress?.completedTaskCount ?? 0, room.tasks.length),
      completedTaskCount: roomProgress?.completedTaskCount ?? 0,
      pointsEarned: roomProgress?.pointsEarned ?? 0,
    },
    tasks: room.tasks.map((task) => {
      const progress = taskProgress.get(task.id);

      return {
        id: task.id,
        orderIndex: task.orderIndex,
        title: task.title,
        durationLabel: task.durationLabel,
        points: task.points,
        sections: readSections(task.sections),
        completed: progress?.status === 'COMPLETED',
        questions: task.questions.map((question) => {
          const state = answers.get(question.id);
          const solved = state?.isCorrect ?? false;

          return {
            id: question.id,
            orderIndex: question.orderIndex,
            type: question.type,
            prompt: question.prompt,
            points: question.points,
            options: question.options.map((option) => ({
              id: option.id,
              orderIndex: option.orderIndex,
              label: option.label,
            })),
            answered: state?.answered ?? false,
            solved,
            explanation: solved ? question.explanation : null,
          };
        }),
      };
    }),
  };
}

/// Author-facing view. Includes the answer key, so it is only ever returned to
/// teachers and admins.
export function toRoomDetailForAuthor(room: RoomWithContent) {
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    shortTitle: room.shortTitle,
    eyebrow: room.eyebrow,
    description: room.description,
    category: room.category,
    type: room.type,
    difficulty: room.difficulty,
    durationLabel: room.durationLabel,
    points: room.points,
    accent: room.accent,
    objectives: room.objectives,
    sourceFile: room.sourceFile,
    status: room.status,
    orderIndex: room.orderIndex,
    publishedAt: room.publishedAt,
    moduleId: room.moduleId,
    path: { id: room.module.path.id, slug: room.module.path.slug, title: room.module.path.title },
    module: { id: room.module.id, slug: room.module.slug, title: room.module.title },
    tasks: room.tasks.map((task) => ({
      id: task.id,
      orderIndex: task.orderIndex,
      title: task.title,
      durationLabel: task.durationLabel,
      points: task.points,
      sections: readSections(task.sections),
      questions: task.questions.map((question) => ({
        id: question.id,
        orderIndex: question.orderIndex,
        type: question.type,
        prompt: question.prompt,
        explanation: question.explanation,
        points: question.points,
        acceptedAnswers: question.acceptedAnswers,
        options: question.options.map((option) => ({
          id: option.id,
          orderIndex: option.orderIndex,
          label: option.label,
          isCorrect: option.isCorrect,
        })),
      })),
    })),
  };
}

export function percentOf(completed: number, total: number): number {
  if (total <= 0) return 0;

  return Math.round((completed / total) * 100);
}
