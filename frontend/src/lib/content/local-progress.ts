export const LOCAL_PROGRESS_KEY = "kibereduaz:room-progress:v1";

export type LocalRoomProgress = {
  completedTaskIds: string[];
  solvedQuestionIds: string[];
  earnedPoints: number;
  lastTaskId: string | null;
};

export type LocalProgressState = {
  version: 1;
  rooms: Record<string, LocalRoomProgress>;
};

export function emptyLocalProgress(): LocalProgressState {
  return { version: 1, rooms: {} };
}

export function parseLocalProgress(raw: string | null): LocalProgressState {
  if (!raw) return emptyLocalProgress();

  try {
    const value = JSON.parse(raw) as unknown;
    if (!isLocalProgressState(value)) return emptyLocalProgress();
    return value;
  } catch {
    return emptyLocalProgress();
  }
}

export function serializeLocalProgress(state: LocalProgressState): string {
  return JSON.stringify(state);
}

export function completeLocalTask(
  state: LocalProgressState,
  roomSlug: string,
  taskId: string,
  points: number,
): LocalProgressState {
  const room = roomProgressOf(state, roomSlug);
  const alreadyCompleted = room.completedTaskIds.includes(taskId);

  return replaceRoom(state, roomSlug, {
    ...room,
    completedTaskIds: alreadyCompleted ? room.completedTaskIds : [...room.completedTaskIds, taskId],
    earnedPoints: alreadyCompleted ? room.earnedPoints : room.earnedPoints + Math.max(0, points),
    lastTaskId: taskId,
  });
}

export function solveLocalQuestion(
  state: LocalProgressState,
  roomSlug: string,
  taskId: string,
  questionId: string,
  points: number,
): LocalProgressState {
  const room = roomProgressOf(state, roomSlug);
  const alreadySolved = room.solvedQuestionIds.includes(questionId);

  return replaceRoom(state, roomSlug, {
    ...room,
    solvedQuestionIds: alreadySolved
      ? room.solvedQuestionIds
      : [...room.solvedQuestionIds, questionId],
    earnedPoints: alreadySolved ? room.earnedPoints : room.earnedPoints + Math.max(0, points),
    lastTaskId: taskId,
  });
}

export function setLastVisitedTask(
  state: LocalProgressState,
  roomSlug: string,
  taskId: string,
): LocalProgressState {
  return replaceRoom(state, roomSlug, {
    ...roomProgressOf(state, roomSlug),
    lastTaskId: taskId,
  });
}

function roomProgressOf(state: LocalProgressState, roomSlug: string): LocalRoomProgress {
  return (
    state.rooms[roomSlug] ?? {
      completedTaskIds: [],
      solvedQuestionIds: [],
      earnedPoints: 0,
      lastTaskId: null,
    }
  );
}

function replaceRoom(
  state: LocalProgressState,
  roomSlug: string,
  room: LocalRoomProgress,
): LocalProgressState {
  return {
    version: 1,
    rooms: {
      ...state.rooms,
      [roomSlug]: room,
    },
  };
}

function isLocalProgressState(value: unknown): value is LocalProgressState {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.rooms)) return false;

  return Object.values(value.rooms).every((room) => {
    if (!isRecord(room)) return false;
    return (
      isStringArray(room.completedTaskIds) &&
      isStringArray(room.solvedQuestionIds) &&
      typeof room.earnedPoints === "number" &&
      Number.isFinite(room.earnedPoints) &&
      room.earnedPoints >= 0 &&
      (room.lastTaskId === null || typeof room.lastTaskId === "string")
    );
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

