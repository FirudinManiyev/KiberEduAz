import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { LOCAL_ROOM_CATALOG, getLocalRoomDefinition } from "../src/lib/content/catalog.ts";
import { parseLocalMarkdown } from "../src/lib/content/markdown-parser.ts";
import { HOLBERTON_ROOM_CATALOG } from "../src/lib/content/holberton-rooms.generated.ts";

async function parseFixture(slug) {
  const definition = getLocalRoomDefinition(slug);
  assert.ok(definition, slug);
  const source = await readFile(new URL(`../src/data/${definition.sourceFile}`, import.meta.url), "utf8");
  return parseLocalMarkdown(definition, source);
}

test("Blue Team markdown becomes five tasks with preserved tables, code, and questions", async () => {
  const room = await parseFixture("introduction-to-blue-team");

  assert.equal(room.tasks.length, 5);
  assert.equal(room.tasks[0].title, "Blue Team Nədir və Niyə Vacibdir?");
  assert.match(room.tasks[0].markdown, /\| Komanda \| Rolu \| Analogiya \|/);
  assert.match(room.tasks[2].markdown, /```json/);
  assert.equal(room.tasks[0].questions.length, 2);
  assert.equal(
    room.tasks[0].questions[0].prompt,
    'Aşağıdakı fəlsəfəni tamamla: "Hücumçu yalnız 1 dəfə haqlı olmalıdır, müdafiəçi isə ____ ."',
  );
  assert.equal(room.tasks[0].questions[0].format, "bir söz (Azərbaycan dilində)");
  assert.doesNotMatch(room.tasks[0].markdown, /\*\*Sual 1\.1\*\*/);
});

test("curated GRC heading groups become five non-empty English lesson tasks", async () => {
  const room = await parseFixture("grc-frameworks-landscape");

  assert.equal(room.tasks.length, 5);
  assert.deepEqual(
    room.tasks.map((task) => task.title),
    [
      "Çərçivələrə giriş",
      "Əsas çərçivələr",
      "Domen-yönümlü çərçivələr",
      "Uyğunluq və düzgün seçim",
      "Case study və yekun",
    ],
  );
  assert.ok(room.tasks.every((task) => task.markdown.length > 300));
  assert.match(room.tasks[1].markdown, /### COSO ERM/);
  assert.match(room.tasks[2].markdown, /### ISO 27001/);
  assert.match(room.tasks[3].markdown, /## Choosing the Right Framework/);
});

test("every imported Holberton room parses into tasks with no leaked answer key", async () => {
  assert.equal(HOLBERTON_ROOM_CATALOG.length, 37);

  for (const definition of HOLBERTON_ROOM_CATALOG) {
    const room = await parseFixture(definition.slug);

    assert.equal(room.tasks.length, definition.taskGroups.length, definition.slug);
    assert.ok(
      room.tasks.every((task) => task.markdown.length > 100),
      `${definition.slug}: every task must carry lesson content`,
    );

    for (const task of room.tasks) {
      assert.doesNotMatch(task.markdown, /CƏVAB AÇARI/i, `${definition.slug}: answer key must be stripped`);
      assert.doesNotMatch(task.markdown, /Yekun Yoxlama/i, `${definition.slug}: summary quiz must be stripped`);
      assert.doesNotMatch(task.markdown, /^###\s+Sual/im, `${definition.slug}: questions must be extracted, not left as headings`);
    }
  }
});

test("imported rooms expand the discoverable catalogue", () => {
  const importedSlugs = new Set(HOLBERTON_ROOM_CATALOG.map((room) => room.slug));
  const inCatalogue = LOCAL_ROOM_CATALOG.filter((room) => importedSlugs.has(room.slug));
  assert.equal(inCatalogue.length, HOLBERTON_ROOM_CATALOG.length);
});

test("parser rejects a source whose configured task heading is missing", () => {
  const definition = getLocalRoomDefinition("risk-identification");
  assert.ok(definition);

  assert.throws(
    () => parseLocalMarkdown(definition, "# Empty source"),
    /task heading.+not found/i,
  );
});
