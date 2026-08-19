import { HOLBERTON_ROOM_CATALOG } from "@/lib/content/holberton-rooms.generated";
import type { LearningTrack, LocalRoomDefinition } from "@/lib/content/types";

export const API_ROOM_PRESENTATION: Record<
  string,
  { image: string; imageAlt: string; track: LearningTrack }
> = {
  "intro-to-pentesting": {
    image: "/images/hacker_photo2.jpg",
    imageAlt: "Kompüter qarşısında etik hücum laboratoriyası",
    track: "Red Team",
  },
  "grc-foundations": {
    image: "/images/cybershield_photo.png",
    imageAlt: "Rəqəmsal qalxan və kibertəhlükəsizlik təsviri",
    track: "GRC",
  },
};

export const LOCAL_ROOM_CATALOG: readonly LocalRoomDefinition[] = [
  {
    slug: "grc-roles-three-lines",
    title: "GRC rolları və Üç Xətt Modeli",
    shortTitle: "GRC rolları",
    eyebrow: "GRC · Məsuliyyət",
    description:
      "Riskin kimə məxsus olduğunu, nəzarət funksiyalarını və daxili auditin müstəqil rolunu aydınlaşdır.",
    category: "GRC",
    type: "ANALYSIS",
    difficulty: "BEGINNER",
    durationLabel: "50–60 dəq",
    points: 600,
    accent: "GREEN",
    objectives: [
      "Üç Xətt Modelində məsuliyyət bölgüsünü izah etmək",
      "Birinci, ikinci və üçüncü xəttin fərqini müəyyənləşdirmək",
      "RACI matrisini GRC ssenarisinə tətbiq etmək",
    ],
    path: "İdarəetmə, Risk və Uyğunluq",
    module: "GRC təməli",
    sourceFile: "GRC_Roles_and_Three_Lines_Model (1).md",
    image: "/images/cybershield_photo.png",
    imageAlt: "İdarəetmə və təhlükəsizliyi simvolizə edən rəqəmsal qalxan",
    taskGroups: [
      { id: "roles-context", title: "Məsuliyyət niyə vacibdir?", startHeading: "Before You Start: A Simple Analogy", endBefore: "The Three Lines Model — Overview", durationLabel: "10 dəq", points: 100 },
      { id: "roles-lines", title: "Üç Xətt Modeli", startHeading: "The Three Lines Model — Overview", endBefore: "Putting the Whole Picture Together", durationLabel: "14 dəq", points: 140 },
      { id: "roles-picture", title: "Rolların bütöv mənzərəsi", startHeading: "Putting the Whole Picture Together", endBefore: "RACI Matrix — Applying It to GRC", durationLabel: "12 dəq", points: 120 },
      { id: "roles-raci", title: "RACI və praktiki tətbiq", startHeading: "RACI Matrix — Applying It to GRC", endBefore: "Common Mistakes and Role Confusion", durationLabel: "12 dəq", points: 140 },
      { id: "roles-review", title: "Səhvlər, case study və yekun", startHeading: "Common Mistakes and Role Confusion", durationLabel: "12 dəq", points: 100 },
    ],
  },
  {
    slug: "grc-frameworks-landscape",
    title: "GRC çərçivələrinin mənzərəsi",
    shortTitle: "GRC çərçivələri",
    eyebrow: "GRC · Framework-lər",
    description:
      "COSO, ISO, COBIT və NIST çərçivələrinin hansı problemi həll etdiyini və necə seçildiyini öyrən.",
    category: "GRC",
    type: "ANALYSIS",
    difficulty: "INTERMEDIATE",
    durationLabel: "60–75 dəq",
    points: 700,
    accent: "GREEN",
    objectives: [
      "Əsas və domen-yönümlü çərçivələri ayırmaq",
      "Sertifikatlaşdırılan və bələdçi standartları müqayisə etmək",
      "Təşkilat üçün uyğun çərçivə kombinasiyasını seçmək",
    ],
    path: "İdarəetmə, Risk və Uyğunluq",
    module: "GRC təməli",
    sourceFile: "GRC_Frameworks_Landscape.md",
    image: "/images/computer_photo.png",
    imageAlt: "GRC çərçivələrinin öyrənilməsi üçün kompüter təsviri",
    taskGroups: [
      { id: "framework-context", title: "Çərçivələrə giriş", startHeading: "Before You Start: A Simple Analogy", endBefore: "Two Categories of Frameworks", durationLabel: "12 dəq", points: 120 },
      { id: "framework-foundations", title: "Əsas çərçivələr", startHeading: "Two Categories of Frameworks", endBefore: "Domain-Specific Frameworks — The Detailed Maps", durationLabel: "16 dəq", points: 160 },
      { id: "framework-domain", title: "Domen-yönümlü çərçivələr", startHeading: "Domain-Specific Frameworks — The Detailed Maps", endBefore: "Regulations Are Not Frameworks — But They Overlap", durationLabel: "16 dəq", points: 160 },
      { id: "framework-selection", title: "Uyğunluq və düzgün seçim", startHeading: "Regulations Are Not Frameworks — But They Overlap", endBefore: "Common Mistakes", durationLabel: "16 dəq", points: 160 },
      { id: "framework-review", title: "Case study və yekun", startHeading: "Common Mistakes", durationLabel: "15 dəq", points: 100 },
    ],
  },
  {
    slug: "risk-identification",
    title: "Risklərin müəyyənləşdirilməsi",
    shortTitle: "Risk identifikasiyası",
    eyebrow: "GRC · Risk analizi",
    description:
      "Riskləri hadisəyə çevrilməzdən əvvəl tap, düzgün risk ifadəsi yaz və praktik identifikasiya üsullarını tətbiq et.",
    category: "GRC",
    type: "ANALYSIS",
    difficulty: "BEGINNER",
    durationLabel: "45–55 dəq",
    points: 550,
    accent: "RED",
    objectives: [
      "Risk, problem və insident anlayışlarını ayırmaq",
      "Risk identifikasiyası texnikalarını seçmək",
      "Səbəb–hadisə–təsir formatında risk ifadəsi yazmaq",
    ],
    path: "İdarəetmə, Risk və Uyğunluq",
    module: "Risk idarəetməsi",
    sourceFile: "Risk_Identification.md",
    image: "/images/database_photo.jpg",
    imageAlt: "Risk məlumatlarının analizini göstərən texnoloji görüntü",
    taskGroups: [
      { id: "risk-context", title: "Riskləri əvvəlcədən görmək", startHeading: "Before You Start: A Simple Analogy", endBefore: "Risk vs. Issue vs. Incident — Getting the Vocabulary Right", durationLabel: "10 dəq", points: 90 },
      { id: "risk-language", title: "Risk, problem və insident", startHeading: "Risk vs. Issue vs. Incident — Getting the Vocabulary Right", endBefore: "Risk Identification Techniques", durationLabel: "10 dəq", points: 110 },
      { id: "risk-techniques", title: "İdentifikasiya texnikaları", startHeading: "Risk Identification Techniques", endBefore: "Top-Down vs. Bottom-Up Identification", durationLabel: "12 dəq", points: 130 },
      { id: "risk-practice", title: "Yuxarıdan-aşağı və aşağıdan-yuxarı", startHeading: "Top-Down vs. Bottom-Up Identification", endBefore: "Key Terminology", durationLabel: "12 dəq", points: 130 },
      { id: "risk-review", title: "Terminlər və yekun yoxlama", startHeading: "Key Terminology", durationLabel: "10 dəq", points: 90 },
    ],
  },
  {
    slug: "introduction-to-blue-team",
    title: "Blue Team-ə giriş və müdafiə əsasları",
    shortTitle: "Blue Team-ə giriş",
    eyebrow: "Blue Team · Müdafiə",
    description:
      "SOC, insident reaksiyası, rəqəmsal ekspertiza və çoxqatlı müdafiə ilə mavi komandanın işini kəşf et.",
    category: "Blue Team",
    type: "WALKTHROUGH",
    difficulty: "BEGINNER",
    durationLabel: "45–60 dəq",
    points: 600,
    accent: "GREEN",
    objectives: [
      "Blue Team və SOC rollarını izah etmək",
      "Əsas müdafiə alətlərini fərqləndirmək",
      "Sadə insident ssenarisini analiz etmək",
    ],
    path: "Müdafiə təhlükəsizliyi",
    module: "Blue Team təməli",
    sourceFile: "introduction-to-blue-team.md",
    image: "/images/cyber_class_photo.jpg",
    imageAlt: "Kibertəhlükəsizlik dərsində çalışan tələbələr",
    taskGroups: [1, 2, 3, 4, 5].map((index) => ({
      id: `blue-team-${index}`,
      title: `Task ${index}`,
      startHeading: `Task ${index}`,
      durationLabel: index === 4 ? "14 dəq" : "10 dəq",
      points: index === 4 ? 160 : 110,
    })),
  },
  {
    slug: "soc-windows-event-logs-sysmon",
    title: "SOC analizi: Windows jurnalları və Sysmon",
    shortTitle: "SOC log analizi",
    eyebrow: "Blue Team · SOC",
    description:
      "Windows Event ID-lərini, Sysmon telemetriyasını və şübhəli PowerShell zəncirini analitik kimi araşdır.",
    category: "Blue Team",
    type: "ANALYSIS",
    difficulty: "INTERMEDIATE",
    durationLabel: "50–60 dəq",
    points: 700,
    accent: "RED",
    objectives: [
      "Əsas Windows təhlükəsizlik Event ID-lərini tanımaq",
      "Sysmon məlumatını standart loglardan ayırmaq",
      "Log zəncirindən insident hekayəsi qurmaq",
    ],
    path: "Müdafiə təhlükəsizliyi",
    module: "SOC və log analizi",
    sourceFile: "soc-analysis-windows-event-logs-sysmon.md",
    image: "/images/database_photo.jpg",
    imageAlt: "SOC məlumat və log analizi ekranları",
    taskGroups: [1, 2, 3, 4, 5].map((index) => ({
      id: `soc-logs-${index}`,
      title: `Task ${index}`,
      startHeading: `Task ${index}`,
      durationLabel: index === 4 ? "14 dəq" : "11 dəq",
      points: index === 4 ? 180 : 130,
    })),
  },
  ...HOLBERTON_ROOM_CATALOG,
] as const;

export function getLocalRoomDefinition(slug: string): LocalRoomDefinition | null {
  return LOCAL_ROOM_CATALOG.find((room) => room.slug === slug) ?? null;
}

