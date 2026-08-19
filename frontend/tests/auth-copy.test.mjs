import assert from "node:assert/strict";
import { test } from "node:test";

import { authPendingLabel } from "../src/lib/auth/copy.ts";

test("every auth flow exposes a specific Azerbaijani pending message", () => {
  assert.equal(authPendingLabel("login"), "Giriş yoxlanılır…");
  assert.equal(authPendingLabel("register"), "Hesab yaradılır…");
  assert.equal(authPendingLabel("register-teacher"), "Müraciət göndərilir…");
});
