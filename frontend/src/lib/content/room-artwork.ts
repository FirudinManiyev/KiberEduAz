import type { LearningTrack } from "@/lib/content/types";

export type RoomArtworkInput = {
  slug: string;
  title: string;
  category: string;
};

export type RoomArtwork = {
  image: string;
  imageAlt: string;
  track: LearningTrack;
};

type ArtworkRule = {
  pattern: RegExp;
  image: string;
};

const TOPIC_RULES: readonly ArtworkRule[] = [
  { pattern: /soc|sysmon|log|jurnal|siem/, image: "/images/soc_photo.jpg" },
  { pattern: /sql|database|verilənlər bazası/, image: "/images/sql_photo.jpg" },
  { pattern: /auth|login|parol|password/, image: "/images/authentication.jpg" },
  { pattern: /http|https|web protokol/, image: "/images/http_photo.jpg" },
  { pattern: /kali|linux/, image: "/images/linux_photo.jpg" },
  { pattern: /grc|risk|uyğunluq|compliance|framework|audit|cvss/, image: "/images/grc_photo.jpg" },
  { pattern: /pentest|penetration/, image: "/images/pentest_photo.jpg" },
];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("az");
}

function resolveTrack(category: string): LearningTrack {
  const normalized = normalize(category);

  if (normalized.includes("blue") || normalized.includes("müdafiə")) return "Blue Team";
  if (normalized.includes("grc") || normalized.includes("risk") || normalized.includes("uyğunluq")) return "GRC";
  return "Red Team";
}

export function resolveRoomArtwork(room: RoomArtworkInput): RoomArtwork {
  const track = resolveTrack(room.category);
  const searchableText = normalize(`${room.slug} ${room.title} ${room.category}`);
  const topicImage = TOPIC_RULES.find((rule) => rule.pattern.test(searchableText))?.image;
  const fallbackImage =
    track === "Blue Team"
      ? "/images/blue_team.webp"
      : track === "GRC"
        ? "/images/grc_photo.jpg"
        : "/images/red_team.jpg";

  return {
    image: topicImage ?? fallbackImage,
    imageAlt: `${room.title} mövzusu üçün kibertəhlükəsizlik təlim təsviri`,
    track,
  };
}
