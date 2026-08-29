import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { LOCAL_ROOM_CATALOG, getLocalRoomDefinition } from "../src/lib/content/catalog.ts";
import { decorateApiRoomDetail, mergeRoomSummaries } from "../src/lib/content/rooms.ts";

const progress = {
  status: null,
  percent: 0,
  completedTaskCount: 0,
  pointsEarned: 0,
};

const apiRooms = [
  {
    id: "api-pentest",
    slug: "intro-to-pentesting",
    title: "Pentestinqə giriş",
    shortTitle: "Pentestinq",
    eyebrow: "Red Team",
    description: "Etik hücumun əsasları",
    category: "Red Team",
    type: "WALKTHROUGH",
    difficulty: "BEGINNER",
    durationLabel: "45 dəq",
    points: 500,
    accent: "RED",
    objectives: [],
    status: "PUBLISHED",
    path: "Hücum təhlükəsizliyi",
    module: "Red Team təməli",
    taskCount: 5,
    progress,
  },
  {
    id: "api-grc",
    slug: "grc-foundations",
    title: "GRC əsasları",
    shortTitle: "GRC",
    eyebrow: "GRC",
    description: "İdarəetmə, risk və uyğunluq",
    category: "GRC",
    type: "ANALYSIS",
    difficulty: "BEGINNER",
    durationLabel: "60 dəq",
    points: 650,
    accent: "GREEN",
    objectives: [],
    status: "PUBLISHED",
    path: "GRC və idarəetmə",
    module: "GRC təməli",
    taskCount: 5,
    progress,
  },
];

test("local catalogue merges with API rooms into a unique discoverable set", () => {
  const merged = mergeRoomSummaries(apiRooms);
  const localCount = LOCAL_ROOM_CATALOG.length;

  assert.ok(localCount >= 5, "expected the seeded local rooms to remain");
  assert.equal(merged.length, localCount + apiRooms.length);
  assert.equal(new Set(merged.map((room) => room.slug)).size, merged.length);
  assert.ok(merged.every((room) => room.image.startsWith("/images/")));
  assert.equal(merged.filter((room) => room.progressMode === "local").length, localCount);
  assert.equal(merged.filter((room) => room.progressMode === "api").length, 2);
});

test("catalogue slugs are unique", () => {
  const slugs = LOCAL_ROOM_CATALOG.map((room) => room.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("catalogue references existing markdown and image assets", () => {
  for (const room of LOCAL_ROOM_CATALOG) {
    const markdownUrl = new URL(`../src/data/${room.sourceFile}`, import.meta.url);
    const imageUrl = new URL(`../public${room.image}`, import.meta.url);

    assert.equal(existsSync(fileURLToPath(markdownUrl)), true, room.sourceFile);
    assert.equal(existsSync(fileURLToPath(imageUrl)), true, room.image);
  }
});

test("API rooms receive presentation metadata without losing API progress", () => {
  const apiWithProgress = {
    ...apiRooms[0],
    progress: { ...progress, percent: 40, completedTaskCount: 2, pointsEarned: 200 },
  };
  const [merged] = mergeRoomSummaries([apiWithProgress]);

  assert.equal(merged.progress.percent, 40);
  assert.equal(merged.image, "/images/pentest_photo.jpg");
  assert.equal(merged.progressMode, "api");
});

test("local catalogue lookup returns null for unknown slugs", () => {
  assert.equal(getLocalRoomDefinition("missing-room"), null);
});

test("API room detail keeps server tasks while gaining shared presentation fields", () => {
  const detail = {
    ...apiRooms[0],
    sourceFile: "intro_to_pentesting.md",
    path: { id: "path-red", slug: "red", title: "Hücum təhlükəsizliyi" },
    module: { id: "module-red", slug: "red-foundations", title: "Red Team təməli" },
    tasks: [{ id: "api-task-1", orderIndex: 0, title: "Task", durationLabel: "5 dəq", points: 100, sections: [], completed: false, questions: [] }],
  };

  const decorated = decorateApiRoomDetail(detail);

  assert.equal(decorated.progressMode, "api");
  assert.equal(decorated.tasks, detail.tasks);
  assert.equal(decorated.image, "/images/pentest_photo.jpg");
});

test("local Blue Team, SOC, and GRC rooms use topic-specific supplied artwork", () => {
  assert.equal(getLocalRoomDefinition("introduction-to-blue-team")?.image, "/images/blue_team.webp");
  assert.equal(getLocalRoomDefinition("soc-windows-event-logs-sysmon")?.image, "/images/soc_photo.jpg");
  assert.equal(getLocalRoomDefinition("grc-frameworks-landscape")?.image, "/images/grc_photo.jpg");
});
