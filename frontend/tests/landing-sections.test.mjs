import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentStructure } from "../src/components/landing/content-structure.tsx";
import { RolesSection } from "../src/components/landing/roles-section.tsx";

test("the roles section welcomes cyber learners beyond school-only roles", () => {
  const html = renderToStaticMarkup(createElement(RolesSection));

  assert.match(html, /Kiber öyrənmək istəyən hər kəs üçün/);
  assert.match(html, /Yeni başlayan/);
  assert.match(html, /Bacarıqlarını inkişaf etdirən/);
  assert.match(html, /Bilik paylaşan/);
  assert.doesNotMatch(html, /Məktəb admini|Platforma yalnız şagird üçün deyil/);
});

test("content architecture presents five ordered levels as one labelled learning flow", () => {
  const html = renderToStaticMarkup(createElement(ContentStructure));
  const labels = ["Path", "Module", "Room", "Task", "Sual"];
  const positions = labels.map((label) => html.indexOf(`>${label}<`));

  assert.match(html, /aria-label="Məzmunun beş səviyyəli axını"/);
  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.equal((html.match(/data-structure-level=/g) ?? []).length, 5);
});
