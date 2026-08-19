import assert from "node:assert/strict";
import { test } from "node:test";

import { scrollToPageTop } from "../src/lib/navigation/scroll.ts";

test("route changes request an immediate scroll to page top", () => {
  let received;

  scrollToPageTop((options) => {
    received = options;
  });

  assert.deepEqual(received, { top: 0, left: 0, behavior: "instant" });
});
