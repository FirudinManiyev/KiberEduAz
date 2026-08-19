import assert from "node:assert/strict";
import { test } from "node:test";

import { API_ROOM_PRESENTATION, LOCAL_ROOM_CATALOG } from "../src/lib/content/catalog.ts";
import { ROADMAP_TRACKS, availableRoadmapRooms } from "../src/lib/content/roadmap.ts";

test("roadmap exposes three tracks and every available room exactly once", () => {
  assert.deepEqual(ROADMAP_TRACKS.map((track) => track.id), ["red-team", "blue-team", "grc"]);

  const available = availableRoadmapRooms();
  const knownSlugs = new Set([
    ...Object.keys(API_ROOM_PRESENTATION),
    ...LOCAL_ROOM_CATALOG.map((room) => room.slug),
  ]);

  assert.equal(new Set(available.map((room) => room.slug)).size, available.length);
  assert.ok(
    available.every((room) => knownSlugs.has(room.slug)),
    "every roadmap stage must point at a real catalogue or API room",
  );
  assert.ok(ROADMAP_TRACKS.every((track) => track.stages.some((stage) => stage.status === "locked")));
});

test("roadmap links available stages to their room detail route", () => {
  for (const room of availableRoadmapRooms()) {
    assert.equal(room.href, `/rooms/${room.slug}`);
    assert.match(room.meta, /task · \d+ XP/);
  }
});
