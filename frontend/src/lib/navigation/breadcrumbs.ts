export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const HIDDEN_ROUTES = ["/", "/auth", "/login", "/register"];

const ROUTE_LABELS: Record<string, string> = {
  "/about": "Haqqımızda",
  "/admin": "Admin paneli",
  "/contact": "Əlaqə",
  "/dashboard": "İdarə paneli",
  "/faq": "Tez-tez verilən suallar",
  "/notifications": "Bildirişlər",
  "/pending": "Müraciət statusu",
  "/profile": "Profil",
  "/roadmap": "Təlim xəritəsi",
  "/rooms": "Room-lar",
  "/teacher": "Müəllim paneli",
};

export function breadcrumbsForPathname(pathname: string): BreadcrumbItem[] {
  const normalized = normalizePathname(pathname);

  if (HIDDEN_ROUTES.some((route) => normalized === route || (route !== "/" && normalized.startsWith(`${route}/`)))) {
    return [];
  }

  if (normalized.startsWith("/rooms/")) {
    return [
      { label: "Ana səhifə", href: "/" },
      { label: "Room-lar", href: "/rooms" },
      { label: "Room detalları" },
    ];
  }

  const label = ROUTE_LABELS[normalized] ?? humanizeSegment(normalized.split("/").filter(Boolean).at(-1));

  if (!label) return [];

  return [{ label: "Ana səhifə", href: "/" }, { label }];
}

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : withoutQuery;
}

function humanizeSegment(segment: string | undefined): string | null {
  if (!segment) return null;

  return decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/^./, (character) => character.toLocaleUpperCase("az"));
}
