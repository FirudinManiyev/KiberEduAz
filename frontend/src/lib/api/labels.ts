import type { Difficulty, RoomType } from "./types";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  WALKTHROUGH: "Walkthrough",
  CHALLENGE: "Challenge",
  ANALYSIS: "Analysis",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: "Başlanğıc",
  INTERMEDIATE: "Orta",
  ADVANCED: "Çətin",
};
