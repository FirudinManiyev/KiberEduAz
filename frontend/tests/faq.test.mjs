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

test("FAQ filtering uses only the selected category", () => {
  const all = filterFaqItems(FAQ_ITEMS, "Hamısı");
  const security = filterFaqItems(FAQ_ITEMS, "Müəllim və təhlükəsizlik");

  assert.equal(all.length, FAQ_ITEMS.length);
  assert.ok(security.length >= 3);
  assert.ok(security.every((item) => item.category === "Müəllim və təhlükəsizlik"));
});
