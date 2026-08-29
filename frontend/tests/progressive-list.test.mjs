import assert from "node:assert/strict";
import { test } from "node:test";

import {
  INITIAL_VISIBLE_ITEMS,
  getProgressiveListState,
} from "../src/lib/ui/progressive-list.ts";

const twelveItems = Array.from({ length: 12 }, (_, index) => index + 1);

test("long lists initially expose exactly the first eight items", () => {
  const state = getProgressiveListState(twelveItems, false);

  assert.equal(INITIAL_VISIBLE_ITEMS, 8);
  assert.deepEqual(state.visibleItems, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(state.hiddenCount, 4);
  assert.equal(state.canToggle, true);
});

test("expanded lists expose every item without changing order", () => {
  const state = getProgressiveListState(twelveItems, true);

  assert.deepEqual(state.visibleItems, twelveItems);
  assert.equal(state.hiddenCount, 0);
  assert.equal(state.canToggle, true);
});

test("short lists stay complete and do not need a disclosure control", () => {
  const items = [1, 2, 3, 4, 5];
  const state = getProgressiveListState(items, false);

  assert.deepEqual(state.visibleItems, items);
  assert.equal(state.hiddenCount, 0);
  assert.equal(state.canToggle, false);
});

