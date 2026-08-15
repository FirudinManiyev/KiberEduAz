import assert from "node:assert/strict";
import { test } from "node:test";

import { getAcidRenderProfile } from "../src/lib/effects/acid-render-profile.ts";

test("narrow coarse-pointer screens use the low-cost Acid Squares profile", () => {
  assert.deepEqual(
    getAcidRenderProfile({
      width: 390,
      coarsePointer: true,
      reducedMotion: false,
      devicePixelRatio: 3,
    }),
    {
      detail: "low",
      steps: 20,
      dpr: 1,
      blur: 0,
      mouseInteraction: false,
      animate: true,
    },
  );
});

test("reduced motion renders one low-cost deterministic frame", () => {
  const profile = getAcidRenderProfile({
    width: 1440,
    coarsePointer: false,
    reducedMotion: true,
    devicePixelRatio: 2,
  });

  assert.equal(profile.detail, "low");
  assert.equal(profile.steps, 20);
  assert.equal(profile.dpr, 1);
  assert.equal(profile.blur, 0);
  assert.equal(profile.mouseInteraction, false);
  assert.equal(profile.animate, false);
});

test("wide fine-pointer screens retain the desktop visual profile with capped DPR", () => {
  assert.deepEqual(
    getAcidRenderProfile({
      width: 1440,
      coarsePointer: false,
      reducedMotion: false,
      devicePixelRatio: 2,
    }),
    {
      detail: "medium",
      steps: 32,
      dpr: 1.35,
      blur: 0.53,
      mouseInteraction: true,
      animate: true,
    },
  );
});
