import type { RoomDetail, RoomSummary } from "@/lib/api/types";
import { LOCAL_ROOM_CATALOG } from "@/lib/content/catalog";
import { resolveRoomArtwork } from "@/lib/content/room-artwork";
import type {
  ApiRoomDetailView,
  LearningRoomSummary,
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
  const artwork = resolveRoomArtwork(room);

  return {
    ...room,
    image: artwork.image,
    imageAlt: artwork.imageAlt,
    track: artwork.track,
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
  const artwork = resolveRoomArtwork(room);

  return {
    ...room,
    progressMode: "api",
    image: artwork.image,
    imageAlt: artwork.imageAlt,
  };
}
