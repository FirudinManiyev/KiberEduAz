import assert from "node:assert/strict";
import { test } from "node:test";

import { FAQ_CATEGORIES, FAQ_ITEMS, filterFaqItems } from "../src/lib/faq.ts";

test("FAQ contains four Azerbaijani help categories with useful answers", () => {
  assert.deepEqual(FAQ_CATEGORIES, [
    "Platforma",
    "Hesab və giriş",
    "Room və progress",
    "Müəllim və təhlükəsizlik",
  ]);
  assert.ok(FAQ_ITEMS.length >= 12);
  assert.ok(FAQ_ITEMS.every((item) => item.question.endsWith("?") && item.answer.length > 45));
});

test("FAQ search is Azerbaijani-aware across questions and answers", () => {
  const passwordResults = filterFaqItems(FAQ_ITEMS, "şifrə", "Hamısı");
  const progressResults = filterFaqItems(FAQ_ITEMS, "cihazda saxlanılır", "Hamısı");

  assert.ok(passwordResults.some((item) => item.category === "Hesab və giriş"));
  assert.ok(progressResults.some((item) => item.category === "Room və progress"));
});

test("FAQ category filtering excludes unrelated entries", () => {
  const results = filterFaqItems(FAQ_ITEMS, "", "Müəllim və təhlükəsizlik");

  assert.ok(results.length >= 3);
  assert.ok(results.every((item) => item.category === "Müəllim və təhlükəsizlik"));
});
