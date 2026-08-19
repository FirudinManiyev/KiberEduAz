import assert from "node:assert/strict";
import { test } from "node:test";

import { mobileNavigationFor, navigationFor } from "../src/lib/navigation.ts";

for (const [label, role, pending] of [
  ["guest", undefined, false],
  ["student", "STUDENT", false],
  ["teacher", "TEACHER", false],
  ["admin", "ADMIN", false],
  ["pending teacher", "TEACHER", true],
]) {
  test(`${label} navigation exposes the Azerbaijani FAQ`, () => {
    assert.ok(navigationFor(role, pending).some((item) => item.href === "/faq"));
  });
}

test("signed-in mobile navigation exposes exactly one sign-out action", () => {
  for (const [role, pending] of [["STUDENT", false], ["TEACHER", true], ["ADMIN", false]]) {
    const items = mobileNavigationFor(role, pending, true);
    assert.equal(items.filter((item) => item.kind === "signout").length, 1);
  }
});

test("guest mobile navigation never exposes sign-out or private account links", () => {
  const items = mobileNavigationFor(undefined, false, false);
  assert.equal(items.some((item) => item.kind === "signout"), false);
  assert.equal(items.some((item) => item.kind === "link" && item.href === "/profile"), false);
  assert.ok(items.some((item) => item.kind === "link" && item.href === "/login"));
});

test("active learners get profile and notifications while pending teachers do not", () => {
  const studentItems = mobileNavigationFor("STUDENT", false, true);
  const pendingItems = mobileNavigationFor("TEACHER", true, true);

  assert.ok(studentItems.some((item) => item.kind === "link" && item.href === "/profile"));
  assert.ok(studentItems.some((item) => item.kind === "link" && item.href === "/notifications"));
  assert.equal(pendingItems.some((item) => item.kind === "link" && item.href === "/profile"), false);
  assert.equal(pendingItems.some((item) => item.kind === "link" && item.href === "/notifications"), false);
});
