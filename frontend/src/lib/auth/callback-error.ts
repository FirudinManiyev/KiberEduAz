export type AuthCallbackReason = "expired-link" | "used-link" | "confirmation-failed";

export function safeAuthCallbackReason(reason: unknown): AuthCallbackReason {
  const text = typeof reason === "string" ? reason : "";

  if (/expired|expiry|timed?\s*out/i.test(text)) return "expired-link";
  if (/already|used|consumed/i.test(text)) return "used-link";
  return "confirmation-failed";
}
