import assert from "node:assert/strict";
import test from "node:test";
import { createKiberBotExchange } from "../src/lib/kiberbot/exchange.ts";

test("KiberBot ignores empty and whitespace-only messages", () => {
  assert.equal(createKiberBotExchange(""), null);
  assert.equal(createKiberBotExchange("   \n\t  "), null);
});

test("KiberBot trims the user message and returns the inactive-service reply", () => {
  assert.deepEqual(createKiberBotExchange("  Mənə room seçməyə kömək et  "), {
    userText: "Mənə room seçməyə kömək et",
    reply:
      "KiberBot xidməti hazırda aktiv deyil. Tezliklə burada sənə kömək edə biləcəyəm.",
  });
});
