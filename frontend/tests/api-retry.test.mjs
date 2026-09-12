import assert from "node:assert/strict";
import test from "node:test";

import { API_TIMEOUT_MS, isRetryable, retryDelay, RETRY_DELAYS_MS } from "../src/lib/api/retry.ts";

// ---------------------------------------------------------------------------
// What may be retried
//
// The point of this policy is that a cold Render instance looks like a failure
// but is not an answer, while a 401 very much is one. Getting that backwards is
// what sent a valid session into a /login redirect loop.
// ---------------------------------------------------------------------------

test("a read with no status at all is retried - timeout, DNS, refused connection", () => {
  assert.equal(isRetryable("GET"), true);
  assert.equal(isRetryable("HEAD"), true);
  assert.equal(isRetryable("get"), true, "method comparison is case-insensitive");
});

test("the statuses a proxy returns while the instance wakes are retried", () => {
  for (const status of [408, 502, 503, 504, 522, 524]) {
    assert.equal(isRetryable("GET", status), true, `${status} should be retried`);
  }
});

test("an answer from the API is never retried, however unwelcome", () => {
  for (const status of [400, 401, 403, 404, 409, 422, 500]) {
    assert.equal(isRetryable("GET", status), false, `${status} is an answer, not a stumble`);
  }
});

test("a rate limit is not retried - that would be the opposite of the right response", () => {
  assert.equal(isRetryable("GET", 429), false);
});

test("writes are never retried, even when the failure looks transient", () => {
  // Replaying these could submit an answer twice or create a second room.
  for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
    assert.equal(isRetryable(method), false, `${method} must not be replayed`);
    assert.equal(isRetryable(method, 503), false, `${method} must not be replayed on 503`);
  }
});

// ---------------------------------------------------------------------------
// How long it may go on
// ---------------------------------------------------------------------------

test("the budget is bounded and increases", () => {
  assert.equal(retryDelay(0), RETRY_DELAYS_MS[0]);
  assert.equal(retryDelay(1), RETRY_DELAYS_MS[1]);
  assert.equal(retryDelay(RETRY_DELAYS_MS.length), null, "runs out rather than looping forever");
  assert.ok(RETRY_DELAYS_MS[1] > RETRY_DELAYS_MS[0], "second wait is longer than the first");
});

test("total time stays inside a request that a person is waiting on", () => {
  const worstCase = API_TIMEOUT_MS * (RETRY_DELAYS_MS.length + 1) + RETRY_DELAYS_MS.reduce((a, b) => a + b, 0);

  assert.ok(worstCase <= 60_000, `worst case ${worstCase}ms should stay under a minute`);
});
