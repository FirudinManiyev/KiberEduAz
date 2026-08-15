import type {
  LocalQuestion,
  LocalRoomDefinition,
  LocalRoomDetail,
  LocalRoomTask,
} from "@/lib/content/types";

type Heading = {
  title: string;
  start: number;
  contentStart: number;
};

export function parseLocalMarkdown(
  definition: LocalRoomDefinition,
  source: string,
): LocalRoomDetail {
  const normalizedSource = source.replace(/\r\n/g, "\n");
  const headings = collectLevelTwoHeadings(normalizedSource);

  const tasks = definition.taskGroups.map((group, orderIndex): LocalRoomTask => {
    const startHeading = findHeading(headings, group.startHeading);
    if (!startHeading) {
      throw new Error(
        `Task heading "${group.startHeading}" not found in ${definition.sourceFile}`,
      );
    }

    const nextConfiguredGroup = definition.taskGroups[orderIndex + 1];
    const endHeading = group.endBefore
      ? findHeading(headings, group.endBefore)
      : nextConfiguredGroup
        ? findHeading(headings, nextConfiguredGroup.startHeading)
        : null;
    const rawMarkdown = normalizedSource
      .slice(startHeading.contentStart, endHeading?.start ?? normalizedSource.length)
      .trim();
    const { markdown, questions } = extractQuestions(rawMarkdown, definition.slug, group.id);
    const taskTitle = /^Task\s+\d+$/i.test(group.title)
      ? titleAfterTaskNumber(startHeading.title)
      : group.title;

    if (!markdown) {
      throw new Error(`Task "${group.id}" is empty in ${definition.sourceFile}`);
    }

    return {
      id: `${definition.slug}:${group.id}`,
      orderIndex,
      title: taskTitle,
      durationLabel: group.durationLabel,
      points: group.points,
      markdown,
      questions,
    };
  });

  return {
    id: `local:${definition.slug}`,
    slug: definition.slug,
    title: definition.title,
    shortTitle: definition.shortTitle,
    eyebrow: definition.eyebrow,
    description: definition.description,
    category: definition.category,
    type: definition.type,
    difficulty: definition.difficulty,
    durationLabel: definition.durationLabel,
    points: definition.points,
    accent: definition.accent,
    objectives: definition.objectives,
    sourceFile: definition.sourceFile,
    path: {
      id: `local-path:${slugify(definition.path)}`,
      slug: slugify(definition.path),
      title: definition.path,
    },
    module: {
      id: `local-module:${slugify(definition.module)}`,
      slug: slugify(definition.module),
      title: definition.module,
    },
    progress: {
      status: null,
      percent: 0,
      completedTaskCount: 0,
      pointsEarned: 0,
    },
    progressMode: "local",
    image: definition.image,
    imageAlt: definition.imageAlt,
    tasks,
  };
}

function collectLevelTwoHeadings(source: string): Heading[] {
  const headings: Heading[] = [];
  const pattern = /^##\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    headings.push({
      title: match[1].trim(),
      start: match.index,
      contentStart: match.index + match[0].length,
    });
  }

  return headings;
}

function findHeading(headings: readonly Heading[], expected: string): Heading | null {
  const needle = normalizeHeading(expected);

  return (
    headings.find((heading) => {
      const title = normalizeHeading(heading.title);
      return title === needle || title.startsWith(`${needle} `);
    }) ?? null
  );
}

function normalizeHeading(value: string): string {
  return value
    .replace(/[—–-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");
}

function titleAfterTaskNumber(value: string): string {
  return value.replace(/^Task\s+\d+\s*[—–-]?\s*/i, "").trim() || value;
}

function extractQuestions(
  source: string,
  roomSlug: string,
  taskId: string,
): { markdown: string; questions: LocalQuestion[] } {
  const questions: LocalQuestion[] = [];
  const questionPattern = /^\*\*Sual\s+([\d.]+)\*\*\s*\n([\s\S]*?)(?=\n\*\*Sual\s+[\d.]+\*\*|\n---(?:\n|(?![\s\S]))|\n##\s|(?![\s\S]))/gm;
  const markdown = source.replace(questionPattern, (_full, label: string, block: string) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const formatIndex = lines.findIndex((line) => /^\*Format:/i.test(line));
    const formatLine = formatIndex >= 0 ? lines[formatIndex] : null;
    const promptLines = lines.filter((_, index) => index !== formatIndex);
    const format = formatLine
      ? formatLine.replace(/^\*Format:\s*/i, "").replace(/\*$/, "").trim()
      : null;

    if (promptLines.length > 0) {
      questions.push({
        id: `${roomSlug}:${taskId}:q-${label.replace(/\.$/, "").replace(/\./g, "-")}`,
        prompt: promptLines.join(" "),
        format,
        points: 20,
      });
    }

    return "";
  });

  return {
    markdown: markdown.replace(/\n{3,}/g, "\n\n").trim(),
    questions,
  };
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
