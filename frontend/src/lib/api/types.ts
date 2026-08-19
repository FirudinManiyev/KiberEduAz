export type RoomType = "WALKTHROUGH" | "CHALLENGE" | "ANALYSIS";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ContentAccent = "GREEN" | "RED";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProgressStatus = "IN_PROGRESS" | "COMPLETED";
export type QuestionType = "SINGLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "PENDING" | "REJECTED";

export interface LessonSection {
  heading?: string;
  body: string;
  bullets?: string[];
}

export interface RoomProgressSummary {
  status: ProgressStatus | null;
  percent: number;
  completedTaskCount: number;
  pointsEarned: number;
}

export interface RoomSummary {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  category: string;
  type: RoomType;
  difficulty: Difficulty;
  durationLabel: string;
  points: number;
  accent: ContentAccent;
  objectives: string[];
  status: ContentStatus;
  path: string;
  module: string;
  taskCount: number;
  progress: RoomProgressSummary;
}

/// Note the absence of an `isCorrect` flag on options: the API never sends the
/// answer key to a learner.
export interface RoomQuestion {
  id: string;
  orderIndex: number;
  type: QuestionType;
  prompt: string;
  points: number;
  options: { id: string; orderIndex: number; label: string }[];
  answered: boolean;
  solved: boolean;
  explanation: string | null;
}

export interface RoomTask {
  id: string;
  orderIndex: number;
  title: string;
  durationLabel: string;
  points: number;
  sections: LessonSection[];
  completed: boolean;
  questions: RoomQuestion[];
}

export interface RoomDetail {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  category: string;
  type: RoomType;
  difficulty: Difficulty;
  durationLabel: string;
  points: number;
  accent: ContentAccent;
  objectives: string[];
  sourceFile: string | null;
  path: { id: string; slug: string; title: string };
  module: { id: string; slug: string; title: string };
  progress: RoomProgressSummary;
  tasks: RoomTask[];
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsAwarded: number;
  explanation: string | null;
  correctOptionIds: string[] | null;
  task: {
    id: string;
    completed: boolean;
    solvedQuestionCount: number;
    questionCount: number;
    pointsEarned: number;
  };
  room: {
    id: string;
    status: ProgressStatus;
    completed: boolean;
    completedTaskCount: number;
    taskCount: number;
    percent: number;
    pointsEarned: number;
    completionBonus: number;
  };
  stats: {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    correctAnswers: number;
    totalAnswers: number;
  };
}

export interface Rank {
  name: string;
  level: number;
  currentPoints: number;
  nextThreshold: number | null;
  percent: number;
}

export interface ProgressSummary {
  totalPoints: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  roomsCompleted: number;
  tasksCompleted: number;
  roomsInProgress: number;
  totalPublishedRooms: number;
  rank: Rank;
  recent: {
    slug: string;
    title: string;
    module: string;
    accent: ContentAccent;
    durationLabel: string;
    points: number;
    percent: number;
    status: ProgressStatus;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  points: number;
  roomsCompleted: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface Leaderboard {
  scope: { type: "class" | "organization" | "global"; label: string };
  total: number;
  currentUser: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
}

export interface MyProfile {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  avatarKey: string | null;
  bio: string | null;
  institutionName: string | null;
  classLabel: string | null;
  focusTrack: string | null;
  weeklyGoal: number;
  organizationId: string | null;
  notifications: { newRooms: boolean; streak: boolean; leaderboard: boolean };
  stats: {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    roomsCompleted: number;
    tasksCompleted: number;
  };
  classes: { id: string; name: string; organization: string }[];
  taughtClasses: { id: string; name: string; organization: string; studentCount: number }[];
}

export interface AdminStats {
  users: number;
  students: number;
  teachersActive: number;
  teachersPending: number;
  classes: number;
  roomsPublished: number;
  roomsDraft: number;
  paths: number;
}

export interface PendingTeacher {
  id: string;
  email: string;
  fullName: string | null;
  institutionName: string | null;
  createdAt: string;
  accountStatus: AccountStatus;
  role: UserRole;
}

export interface PendingRoom {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  createdAt: string;
  createdBy: { id: string; fullName: string | null; email: string } | null;
  module: { id: string; title: string; path: { id: string; title: string } };
  _count: { tasks: number };
}

export interface ClassSummary {
  id: string;
  name: string;
  academicYear: string | null;
  organization: { id: string; name: string };
  teacher: { id: string; fullName: string | null; email: string } | null;
  _count: { memberships: number };
}

export interface ClassDetail {
  id: string;
  name: string;
  academicYear: string | null;
  organization: { id: string; name: string };
  teacher: { id: string; fullName: string | null; email: string } | null;
  students: {
    membershipId: string;
    joinedAt: string;
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    stats: { totalPoints: number; roomsCompleted: number } | null;
  }[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  institutionName: string | null;
  classLabel: string | null;
  createdAt: string;
  stats: { totalPoints: number; roomsCompleted: number; currentStreak: number } | null;
}

export interface NotificationFeed {
  unreadCount: number;
  items: {
    id: string;
    type: "TRAINING" | "ACHIEVEMENT" | "SYSTEM";
    title: string;
    body: string;
    href: string | null;
    unread: boolean;
    createdAt: string;
  }[];
}

export interface PathTreeNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string | null;
  imageUrl: string | null;
  category: string;
  status: ContentStatus;
  modules: {
    id: string;
    slug: string;
    title: string;
    description: string;
    status: ContentStatus;
    rooms: {
      id: string;
      slug: string;
      title: string;
      shortTitle: string;
      type: RoomType;
      difficulty: Difficulty;
      durationLabel: string;
      points: number;
      accent: ContentAccent;
      status: ContentStatus;
      taskCount: number;
      percent: number;
    }[];
  }[];
}
