const DEFAULT_MESSAGE =
  "Hazırda əməliyyatı tamamlamaq mümkün deyil. Bir az sonra yenidən cəhd et.";

const TECHNICAL_DETAIL_PATTERN =
  /(?:prisma|sql|postgres|database|stack(?:trace)?|econnrefused|localhost|127\.0\.0\.1|https?:\/\/|bearer\s|authorization|token\s*[=:]|secret\s*[=:]|password\s*[=:]|node_modules|typeerror|syntaxerror)/i;

type ErrorLike = {
  status?: unknown;
  message?: unknown;
};

function errorStatus(cause: unknown): number | null {
  if (!cause || typeof cause !== "object") return null;

  const status = (cause as ErrorLike).status;
  return typeof status === "number" && Number.isFinite(status) ? status : null;
}

function errorText(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  if (cause && typeof cause === "object" && typeof (cause as ErrorLike).message === "string") {
    return (cause as ErrorLike).message as string;
  }
  return typeof cause === "string" ? cause : "";
}

function safeFallback(fallback: string | undefined): string {
  const candidate = fallback?.trim();

  if (!candidate || candidate.length > 140 || TECHNICAL_DETAIL_PATTERN.test(candidate)) {
    return DEFAULT_MESSAGE;
  }

  if (/yenidən|bir az sonra|yoxla/i.test(candidate)) return candidate;
  return `${candidate.replace(/[.!?]+$/, "")}. Bir az sonra yenidən cəhd et.`;
}

export function toUserErrorMessage(cause: unknown, fallback?: string): string {
  const status = errorStatus(cause);
  const text = errorText(cause);

  if (
    cause instanceof TypeError ||
    /failed to fetch|fetch failed|network request failed|networkerror|load failed|offline/i.test(
      text,
    )
  ) {
    return "Bağlantı qurmaq mümkün olmadı. İnternetini yoxlayıb yenidən cəhd et.";
  }

  if (TECHNICAL_DETAIL_PATTERN.test(text)) return safeFallback(fallback);

  if (/invalid login credentials|invalid credentials/i.test(text)) {
    return "E-poçt və ya şifrə yanlışdır.";
  }
  if (/already registered|already been registered|user already exists/i.test(text)) {
    return "Bu e-poçt artıq qeydiyyatdadır.";
  }
  if (/password should be at least|password.*(?:short|length)/i.test(text)) {
    return "Şifrə ən azı 8 simvol olmalıdır.";
  }
  if (/email not confirmed|confirm.*email/i.test(text)) {
    return "E-poçtunu təsdiqləməmisən. Gələn qutunu yoxla.";
  }
  if (/expired.*(?:session|token)|jwt expired/i.test(text)) {
    return "Sessiyan bitib. Yenidən daxil ol.";
  }
  if (/rate limit|too many requests|too many attempts/i.test(text)) {
    return "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd et.";
  }

  if (status === 401) return "Sessiyan bitib. Yenidən daxil ol.";
  if (status === 403) return "Bu əməliyyat üçün icazən yoxdur.";
  if (status === 404) return "Axtardığın məlumat tapılmadı.";
  if (status === 409) return "Bu məlumat artıq mövcuddur.";
  if (status === 400 || status === 422) return "Daxil etdiyin məlumatları yoxla.";
  if (status === 429) {
    return "Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd et.";
  }
  if (status !== null && status >= 500) {
    return "Xidmət hazırda əlçatan deyil. Bir az sonra yenidən cəhd et.";
  }

  return safeFallback(fallback);
}
