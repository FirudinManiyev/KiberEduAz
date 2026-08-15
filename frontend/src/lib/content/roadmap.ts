import { LOCAL_ROOM_CATALOG } from "@/lib/content/catalog";

export type RoadmapStage = {
  title: string;
  meta: string;
  status: "available" | "locked";
  slug?: string;
  href?: string;
};

export type RoadmapTrack = {
  id: "red-team" | "blue-team" | "grc";
  title: string;
  subtitle: string;
  description: string;
  tone: "red" | "blue" | "green";
  progress: number;
  stages: RoadmapStage[];
};

export const ROADMAP_TRACKS: readonly RoadmapTrack[] = [
  {
    id: "red-team",
    title: "Hücum təhlükəsizliyi",
    subtitle: "Red Team xətti",
    description: "Etik və hüquqi çərçivədə sistemlərə hücumçu baxışı ilə yanaşmağı öyrən.",
    tone: "red",
    progress: 33,
    stages: [
      available("intro-to-pentesting", "Pentestinqə giriş", 5, 500),
      locked("Şəbəkə kəşfiyyatı", "Növbəti mərhələ"),
      locked("Web təhlükəsizliyi", "Planlaşdırılır"),
    ],
  },
  {
    id: "blue-team",
    title: "Müdafiə əməliyyatları",
    subtitle: "Blue Team xətti",
    description: "SOC monitorinqi, log analizi və insidentə reaksiya bacarıqlarını ssenarilərlə inkişaf etdir.",
    tone: "blue",
    progress: 67,
    stages: [
      localAvailable("introduction-to-blue-team"),
      localAvailable("soc-windows-event-logs-sysmon"),
      locked("İnsidentə reaksiya laboratoriyası", "Növbəti mərhələ"),
    ],
  },
  {
    id: "grc",
    title: "Risk və uyğunluq",
    subtitle: "GRC xətti",
    description: "İdarəetmə, risk, nəzarət və uyğunluq qərarlarını təşkilati ssenarilərlə əlaqələndir.",
    tone: "green",
    progress: 80,
    stages: [
      available("grc-foundations", "GRC əsasları", 5, 650),
      localAvailable("grc-roles-three-lines"),
      localAvailable("grc-frameworks-landscape"),
      localAvailable("risk-identification"),
      locked("Uyğunluq auditi simulyasiyası", "Yekun mərhələ"),
    ],
  },
] as const;

export function availableRoadmapRooms(): Array<Required<Pick<RoadmapStage, "slug" | "href">> & RoadmapStage> {
  return ROADMAP_TRACKS.flatMap((track) => track.stages).filter(
    (stage): stage is Required<Pick<RoadmapStage, "slug" | "href">> & RoadmapStage =>
      stage.status === "available" && Boolean(stage.slug && stage.href),
  );
}

function available(slug: string, title: string, taskCount: number, points: number): RoadmapStage {
  return {
    title,
    slug,
    href: `/rooms/${slug}`,
    meta: `${taskCount} task · ${points} XP`,
    status: "available",
  };
}

function localAvailable(slug: string): RoadmapStage {
  const room = LOCAL_ROOM_CATALOG.find((candidate) => candidate.slug === slug);
  if (!room) throw new Error(`Roadmap room not found in catalogue: ${slug}`);
  return available(room.slug, room.title, room.taskGroups.length, room.points);
}

function locked(title: string, meta: string): RoadmapStage {
  return { title, meta, status: "locked" };
}

