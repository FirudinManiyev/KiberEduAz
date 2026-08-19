import type { RoomDetail, RoomSummary } from "@/lib/api/types";

export type LearningTrack = "Red Team" | "Blue Team" | "GRC";
export type ProgressMode = "api" | "local";

export type LocalTaskGroup = {
  id: string;
  title: string;
  startHeading: string;
  endBefore?: string;
  durationLabel: string;
  points: number;
};

export type LocalRoomDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  category: LearningTrack;
  type: RoomSummary["type"];
  difficulty: RoomSummary["difficulty"];
  durationLabel: string;
  points: number;
  accent: RoomSummary["accent"];
  objectives: string[];
  path: string;
  module: string;
  sourceFile: string;
  image: string;
  imageAlt: string;
  taskGroups: LocalTaskGroup[];
};

export type LearningRoomSummary = RoomSummary & {
  image: string;
  imageAlt: string;
  track: LearningTrack;
  progressMode: ProgressMode;
};

export type LocalQuestion = {
  id: string;
  prompt: string;
  format: string | null;
  points: number;
};

export type LocalRoomTask = {
  id: string;
  orderIndex: number;
  title: string;
  durationLabel: string;
  points: number;
  markdown: string;
  questions: LocalQuestion[];
};

export type LocalRoomDetail = Omit<RoomDetail, "tasks"> & {
  progressMode: "local";
  image: string;
  imageAlt: string;
  tasks: LocalRoomTask[];
};

export type ApiRoomDetailView = RoomDetail & {
  progressMode: "api";
  image: string;
  imageAlt: string;
};

export type LearningRoomDetail = LocalRoomDetail | ApiRoomDetailView;

