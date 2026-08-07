export type RoomType = "Walkthrough" | "Challenge" | "Analysis";

export type Difficulty = "Başlanğıc" | "Orta" | "Çətin";

export type LessonSection = {
  heading?: string;
  body: string;
  bullets?: string[];
};

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type RoomTask = {
  id: number;
  title: string;
  duration: string;
  sections: LessonSection[];
  question: QuizQuestion;
};

export type Room = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  path: string;
  module: string;
  category: "Hücum təhlükəsizliyi" | "GRC";
  type: RoomType;
  difficulty: Difficulty;
  duration: string;
  points: number;
  progress: number;
  learners: number;
  accent: "green" | "blue";
  sourceFile: string;
  objectives: string[];
  tasks: RoomTask[];
};
