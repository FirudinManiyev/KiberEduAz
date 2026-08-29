import assert from "node:assert/strict";
import test from "node:test";
import { toUserErrorMessage } from "../src/lib/errors/user-error.ts";

test("HTTP error categories return actionable Azerbaijani messages", () => {
  const cases = [
    [401, "Sessiyan bitib. Yenidən daxil ol."],
    [403, "Bu əməliyyat üçün icazən yoxdur."],
    [404, "Axtardığın məlumat tapılmadı."],
    [409, "Bu məlumat artıq mövcuddur."],
    [422, "Daxil etdiyin məlumatları yoxla."],
    [429, "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd et."],
    [503, "Xidmət hazırda əlçatan deyil. Bir az sonra yenidən cəhd et."],
  ];

  for (const [status, expected] of cases) {
    assert.equal(toUserErrorMessage({ status, message: "internal service failure" }), expected);
  }
});

test("network and authentication failures are translated without echoing provider text", () => {
  assert.equal(
    toUserErrorMessage(new TypeError("Failed to fetch http://127.0.0.1:4000/api/v1/profiles/me")),
    "Bağlantı qurmaq mümkün olmadı. İnternetini yoxlayıb yenidən cəhd et.",
  );
  assert.equal(
    toUserErrorMessage(new Error("Invalid login credentials")),
    "E-poçt və ya şifrə yanlışdır.",
  );
});

test("unknown technical errors use a safe fallback and never leak internal details", () => {
  const technical = "PrismaClientKnownRequestError SQL ECONNREFUSED token=secret-value";
  const message = toUserErrorMessage(new Error(technical), "Profil saxlanıla bilmədi.");

  assert.equal(message, "Profil saxlanıla bilmədi. Bir az sonra yenidən cəhd et.");
  assert.doesNotMatch(message, /Prisma|SQL|ECONNREFUSED|secret-value/i);
});

test("unsafe fallback text is replaced by the neutral service message", () => {
  const message = toUserErrorMessage(
    new Error("Unexpected failure"),
    "Database connection failed at postgres://admin:password@localhost",
  );

  assert.equal(message, "Hazırda əməliyyatı tamamlamaq mümkün deyil. Bir az sonra yenidən cəhd et.");
});
