import type { RoomDetail, RoomSummary } from "@/lib/api/types";
import { API_ROOM_PRESENTATION, LOCAL_ROOM_CATALOG } from "@/lib/content/catalog";
import type {
  ApiRoomDetailView,
  LearningRoomSummary,
  LearningTrack,
} from "@/lib/content/types";

const EMPTY_PROGRESS = {
  status: null,
  percent: 0,
  completedTaskCount: 0,
  pointsEarned: 0,
} as const;

export function localRoomSummaries(): LearningRoomSummary[] {
  return LOCAL_ROOM_CATALOG.map((room) => ({
    id: `local:${room.slug}`,
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
    status: "PUBLISHED",
    path: room.path,
    module: room.module,
    taskCount: room.taskGroups.length,
    progress: { ...EMPTY_PROGRESS },
    image: room.image,
    imageAlt: room.imageAlt,
    track: room.category,
    progressMode: "local",
  }));
}

function decorateApiRoom(room: RoomSummary): LearningRoomSummary {
  const presentation = API_ROOM_PRESENTATION[room.slug];
  const fallbackTrack = normalizeTrack(room.category);

  return {
    ...room,
    image: presentation?.image ?? "/images/computer_photo.png",
    imageAlt: presentation?.imageAlt ?? `${room.title} üçün təlim təsviri`,
    track: presentation?.track ?? fallbackTrack,
    progressMode: "api",
  };
}

export function mergeRoomSummaries(apiRooms: readonly RoomSummary[]): LearningRoomSummary[] {
  const local = localRoomSummaries();
  const seen = new Set<string>();

  return [...apiRooms.map(decorateApiRoom), ...local].filter((room) => {
    if (seen.has(room.slug)) return false;
    seen.add(room.slug);
    return true;
  });
}

export function decorateApiRoomDetail(room: RoomDetail): ApiRoomDetailView {
  const presentation = API_ROOM_PRESENTATION[room.slug];

  return {
    ...room,
    progressMode: "api",
    image: presentation?.image ?? "/images/computer_photo.png",
    imageAlt: presentation?.imageAlt ?? `${room.title} üçün təlim təsviri`,
  };
}

function normalizeTrack(category: string): LearningTrack {
  const normalized = category.toLocaleLowerCase("az");
  if (normalized.includes("blue") || normalized.includes("müdafiə")) return "Blue Team";
  if (normalized.includes("grc") || normalized.includes("risk")) return "GRC";
  return "Red Team";
}
