export type AuthMode = "login" | "register" | "register-teacher";

export function authPendingLabel(mode: AuthMode): string {
  if (mode === "login") return "Giriş yoxlanılır…";
  if (mode === "register") return "Hesab yaradılır…";
  return "Müraciət göndərilir…";
}

