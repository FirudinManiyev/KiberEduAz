import type { UserRole } from "@/lib/api/types";

export type NavigationIcon =
  | "home"
  | "about"
  | "dashboard"
  | "rooms"
  | "roadmap"
  | "contact"
  | "faq"
  | "shield"
  | "notifications"
  | "profile"
  | "login"
  | "register";

export type NavigationLink = {
  kind: "link";
  label: string;
  href: string;
  icon: NavigationIcon;
};

export type MobileNavigationItem = NavigationLink | { kind: "signout"; label: string };

const guestNavigation: NavigationLink[] = [
  link("Ana səhifə", "/", "home"),
  link("Haqqımızda", "/about", "about"),
  link("FAQ", "/faq", "faq"),
  link("Əlaqə", "/contact", "contact"),
];

export function navigationFor(role: UserRole | undefined, pending: boolean): NavigationLink[] {
  if (!role) return guestNavigation;
  if (pending) {
    return [
      link("Ana səhifə", "/", "home"),
      link("Gözləmə", "/pending", "shield"),
      link("Haqqımızda", "/about", "about"),
      link("FAQ", "/faq", "faq"),
      link("Əlaqə", "/contact", "contact"),
    ];
  }
  if (role === "ADMIN") {
    return [
      link("Ana səhifə", "/", "home"),
      link("Admin", "/admin", "shield"),
      link("Room-lar", "/rooms", "rooms"),
      link("Haqqımızda", "/about", "about"),
      link("FAQ", "/faq", "faq"),
      link("Əlaqə", "/contact", "contact"),
    ];
  }
  if (role === "TEACHER") {
    return [
      link("Ana səhifə", "/", "home"),
      link("Müəllim", "/teacher", "dashboard"),
      link("Room-lar", "/rooms", "rooms"),
      link("Roadmap", "/roadmap", "roadmap"),
      link("Haqqımızda", "/about", "about"),
      link("FAQ", "/faq", "faq"),
      link("Əlaqə", "/contact", "contact"),
    ];
  }
  return [
    link("Ana səhifə", "/", "home"),
    link("İdarə paneli", "/dashboard", "dashboard"),
    link("Room-lar", "/rooms", "rooms"),
    link("Roadmap", "/roadmap", "roadmap"),
    link("Haqqımızda", "/about", "about"),
    link("FAQ", "/faq", "faq"),
    link("Əlaqə", "/contact", "contact"),
  ];
}

export function mobileNavigationFor(
  role: UserRole | undefined,
  pending: boolean,
  signedIn: boolean,
): MobileNavigationItem[] {
  const primary = navigationFor(role, pending);

  if (!signedIn) {
    return [
      ...primary,
      link("Daxil ol", "/login", "login"),
      link("Qeydiyyat", "/register", "register"),
      link("Müəllim qeydiyyatı", "/register/teacher", "register"),
    ];
  }

  return [
    ...primary,
    ...(pending
      ? []
      : [
          link("Bildirişlər", "/notifications", "notifications"),
          link("Profil", "/profile", "profile"),
        ]),
    { kind: "signout", label: "Hesabdan çıx" },
  ];
}

function link(label: string, href: string, icon: NavigationIcon): NavigationLink {
  return { kind: "link", label, href, icon };
}

