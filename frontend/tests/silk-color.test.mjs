import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const silkModuleUrl = new URL("../src/components/effects/Silk.tsx", import.meta.url);
const silkModulePath = fileURLToPath(silkModuleUrl);

test("Silk converts the requested #2304a2 shader color to normalized RGB", async () => {
  assert.equal(existsSync(silkModulePath), true, "the Silk background component is missing");

  const { hexToNormalizedRGB } = await import(pathToFileURL(silkModulePath).href);

  assert.deepEqual(hexToNormalizedRGB("#2304a2"), [
    0.13725490196078433,
    0.01568627450980392,
    0.6352941176470588,
  ]);
});

test("Silk renders one low-cost frame for reduced-motion visitors", async () => {
  assert.equal(existsSync(silkModulePath), true, "the Silk background component is missing");

  const { getSilkRenderProfile } = await import(pathToFileURL(silkModulePath).href);
  assert.equal(typeof getSilkRenderProfile, "function", "the Silk render profile is missing");

  assert.deepEqual(
    getSilkRenderProfile({ width: 1440, coarsePointer: false, reducedMotion: true }),
    { dpr: 1, frameloop: "demand" },
  );
});

test("Silk keeps the supplied animated desktop render profile", async () => {
  assert.equal(existsSync(silkModulePath), true, "the Silk background component is missing");

  const { getSilkRenderProfile } = await import(pathToFileURL(silkModulePath).href);
  assert.equal(typeof getSilkRenderProfile, "function", "the Silk render profile is missing");

  assert.deepEqual(
    getSilkRenderProfile({ width: 1440, coarsePointer: false, reducedMotion: false }),
    { dpr: [1, 2], frameloop: "always" },
  );
});

test("Silk caps narrow touch screens to the low-cost render profile", async () => {
  assert.equal(existsSync(silkModulePath), true, "the Silk background component is missing");

  const { getSilkRenderProfile } = await import(pathToFileURL(silkModulePath).href);
  assert.equal(typeof getSilkRenderProfile, "function", "the Silk render profile is missing");

  assert.deepEqual(
    getSilkRenderProfile({ width: 390, coarsePointer: true, reducedMotion: false }),
    { dpr: 1, frameloop: "demand" },
  );
});
