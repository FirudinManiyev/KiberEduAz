import assert from "node:assert/strict";
import { test } from "node:test";

import { scrollToPageTop } from "../src/lib/navigation/scroll.ts";
import {
  getRevealChildDelay,
  getRevealMotionProfile,
} from "../src/lib/motion/reveal.ts";

test("route changes request an immediate scroll to page top", () => {
  let received;

  scrollToPageTop((options) => {
    received = options;
  });

  assert.deepEqual(received, { top: 0, left: 0, behavior: "instant" });
});

test("adjacent sections receive distinct cinematic reveal profiles", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((index) => getRevealMotionProfile(index)),
    [
      { variant: "focus", accent: "red" },
      { variant: "left", accent: "green" },
      { variant: "right", accent: "red" },
      { variant: "rise", accent: "green" },
      { variant: "focus", accent: "red" },
    ],
  );
});

test("child reveal delays stay staggered but cap long sections at 340ms", () => {
  assert.equal(getRevealChildDelay(0), 0);
  assert.equal(getRevealChildDelay(1), 85);
  assert.equal(getRevealChildDelay(4), 340);
  assert.equal(getRevealChildDelay(40), 340);
  assert.equal(getRevealChildDelay(-3), 0);
});
