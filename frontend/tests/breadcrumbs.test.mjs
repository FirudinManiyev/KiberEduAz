import assert from "node:assert/strict";
import { test } from "node:test";

import { breadcrumbsForPathname } from "../src/lib/navigation/breadcrumbs.ts";

test("landing and authentication routes do not render breadcrumbs", () => {
  for (const pathname of ["/", "/login", "/register", "/register/teacher", "/auth/callback"]) {
    assert.deepEqual(breadcrumbsForPathname(pathname), [], pathname);
  }
});

test("a regular public page links back to the landing page", () => {
  assert.deepEqual(breadcrumbsForPathname("/about"), [
    { label: "Ana səhifə", href: "/" },
    { label: "Haqqımızda" },
  ]);
});

test("room detail breadcrumbs preserve the catalogue hierarchy", () => {
  assert.deepEqual(breadcrumbsForPathname("/rooms/intro-to-pentesting"), [
    { label: "Ana səhifə", href: "/" },
    { label: "Room-lar", href: "/rooms" },
    { label: "Room detalları" },
  ]);
});

test("known private routes use concise Azerbaijani labels", () => {
  assert.deepEqual(breadcrumbsForPathname("/teacher"), [
    { label: "Ana səhifə", href: "/" },
    { label: "Müəllim paneli" },
  ]);
  assert.deepEqual(breadcrumbsForPathname("/notifications"), [
    { label: "Ana səhifə", href: "/" },
    { label: "Bildirişlər" },
  ]);
});
