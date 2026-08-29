import assert from "node:assert/strict";
import test from "node:test";
import { safeAuthCallbackReason } from "../src/lib/auth/callback-error.ts";

test("authentication callback errors become safe public reason codes", () => {
  assert.equal(safeAuthCallbackReason("Email link is expired"), "expired-link");
  assert.equal(safeAuthCallbackReason("Token has already been used"), "used-link");
  assert.equal(
    safeAuthCallbackReason("DatabaseError at postgres://admin:secret@localhost"),
    "confirmation-failed",
  );
});
