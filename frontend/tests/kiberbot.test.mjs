import assert from "node:assert/strict";
import test from "node:test";
import {
  createKiberBotExchange,
  KIBERBOT_SUGGESTIONS,
} from "../src/lib/kiberbot/exchange.ts";

test("KiberBot ignores empty and whitespace-only messages", () => {
  assert.equal(createKiberBotExchange(""), null);
  assert.equal(createKiberBotExchange("   \n\t  "), null);
});

test("KiberBot ready questions explain how to use the KiberEduAz platform", () => {
  assert.equal(KIBERBOT_SUGGESTIONS.length, 5);

  assert.deepEqual(
    KIBERBOT_SUGGESTIONS.map(({ question }) => question),
    [
      "Room-a necə başlaya bilərəm?",
      "Room daxilində Task-ları necə tamamlayım?",
      "Təlim xəritəsi nə üçündür?",
      "İrəliləyişimi harada görə bilərəm?",
      "Müəllim panelindən necə istifadə olunur?",
    ],
  );

  for (const suggestion of KIBERBOT_SUGGESTIONS) {
    assert.deepEqual(createKiberBotExchange(`  ${suggestion.question}  `), {
      userText: suggestion.question,
      reply: suggestion.answer,
    });
  }
});

test("KiberBot gives a clear fallback for questions outside its ready answers", () => {
  assert.deepEqual(createKiberBotExchange("  Mənə fərqli bir mövzu izah et  "), {
    userText: "Mənə fərqli bir mövzu izah et",
    reply:
      "Bu sualın cavabını hələ bilmirəm. Hazır suallardan birini seçə və ya FAQ səhifəsinə baxa bilərsən.",
  });
});
