import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { resolveRoomArtwork } from "../src/lib/content/room-artwork.ts";

const cases = [
  ["sql-injection", "SQL Injection", "Red Team", "/images/sql_photo.jpg"],
  ["broken-authentication", "Broken Authentication", "Red Team", "/images/authentication.jpg"],
  ["http-https-derinden", "HTTP/HTTPS dərindən", "Red Team", "/images/http_photo.jpg"],
  ["kali-linux-qurulumu", "Kali Linux qurulumu", "Red Team", "/images/linux_photo.jpg"],
  ["intro-to-pentesting", "Pentestinqə giriş", "Red Team", "/images/pentest_photo.jpg"],
  ["new-soc-room", "Windows log və SOC analizi", "Blue Team", "/images/soc_photo.jpg"],
  ["soc-database-logs", "SOC database log analizi", "Blue Team", "/images/soc_photo.jpg"],
  ["new-risk-room", "Risk qiymətləndirilməsi", "GRC", "/images/grc_photo.jpg"],
];

test("recognizable room topics receive matching artwork", () => {
  for (const [slug, title, category, expectedImage] of cases) {
    const artwork = resolveRoomArtwork({ slug, title, category });

    assert.equal(artwork.image, expectedImage, slug);
    assert.ok(artwork.imageAlt.includes(title), `${slug} alt text should name the room`);
  }
});

test("unknown rooms fall back to artwork for their learning track", () => {
  assert.equal(
    resolveRoomArtwork({ slug: "defence-basics", title: "Müdafiə əsasları", category: "Blue Team" }).image,
    "/images/blue_team.webp",
  );
  assert.equal(
    resolveRoomArtwork({ slug: "compliance-basics", title: "Uyğunluq əsasları", category: "GRC" }).image,
    "/images/grc_photo.jpg",
  );
  assert.equal(
    resolveRoomArtwork({ slug: "offensive-basics", title: "Hücum əsasları", category: "Red Team" }).image,
    "/images/red_team.jpg",
  );
});

test("every resolved room image exists in public images", () => {
  for (const [slug, title, category] of cases) {
    const artwork = resolveRoomArtwork({ slug, title, category });
    const imageUrl = new URL(`../public${artwork.image}`, import.meta.url);

    assert.equal(existsSync(fileURLToPath(imageUrl)), true, artwork.image);
  }
});
