import { SiteHeader, type SiteHeaderUser } from "@/components/layout/site-header";
import { apiFetchOrNull } from "@/lib/api/server";
import type { MyProfile, NotificationFeed } from "@/lib/api/types";

/// Fetches the identity strip and unread badge for the header. Both requests
/// return null when the visitor is signed out, and the header is not rendered
/// on the auth screens anyway.
export async function SiteHeaderContainer() {
  const [profile, notifications] = await Promise.all([
    apiFetchOrNull<MyProfile>("/profiles/me"),
    apiFetchOrNull<NotificationFeed>("/notifications"),
  ]);

  const user: SiteHeaderUser | null = profile
    ? {
        name: shortName(profile.fullName ?? profile.username ?? profile.email),
        initials: initialsOf(profile.fullName ?? profile.username ?? profile.email),
        points: profile.stats.totalPoints,
      }
    : null;

  return <SiteHeader user={user} unreadCount={notifications?.unreadCount ?? 0} />;
}

function shortName(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0].toLocaleUpperCase("az")}.`;
  }

  return parts[0] ?? value;
}

function initialsOf(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toLocaleUpperCase("az");
  }

  return value.slice(0, 2).toLocaleUpperCase("az");
}
