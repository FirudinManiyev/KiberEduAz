import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  API_ROOM_PRESENTATION,
  LOCAL_ROOM_CATALOG,
  getLocalRoomDefinition,
} from "../src/lib/content/catalog.ts";
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

test("five local rooms merge into seven unique discoverable rooms", () => {
  const merged = mergeRoomSummaries(apiRooms);

  assert.equal(LOCAL_ROOM_CATALOG.length, 5);
  assert.equal(merged.length, 7);
  assert.equal(new Set(merged.map((room) => room.slug)).size, 7);
  assert.ok(merged.every((room) => room.image.startsWith("/images/")));
  assert.equal(merged.filter((room) => room.progressMode === "local").length, 5);
  assert.equal(merged.filter((room) => room.progressMode === "api").length, 2);
});

test("catalogue references existing markdown and image assets", () => {
  for (const room of LOCAL_ROOM_CATALOG) {
    const markdownUrl = new URL(`../src/data/${room.sourceFile}`, import.meta.url);
    const imageUrl = new URL(`../public${room.image}`, import.meta.url);

    assert.equal(existsSync(fileURLToPath(markdownUrl)), true, room.sourceFile);
    assert.equal(existsSync(fileURLToPath(imageUrl)), true, room.image);
    assert.match(room.title, /[ƏĞİÖŞÜəğıöşü]/, room.slug);
  }
});

test("API rooms receive presentation metadata without losing API progress", () => {
  const apiWithProgress = {
    ...apiRooms[0],
    progress: { ...progress, percent: 40, completedTaskCount: 2, pointsEarned: 200 },
  };
  const [merged] = mergeRoomSummaries([apiWithProgress]);

  assert.equal(merged.progress.percent, 40);
  assert.equal(merged.image, API_ROOM_PRESENTATION["intro-to-pentesting"].image);
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
  assert.equal(decorated.image, "/images/hacker_photo2.jpg");
});
