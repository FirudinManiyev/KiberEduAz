import type { MyProfile } from "@/lib/api/types";

export function homePathFor(profile: Pick<MyProfile, "role" | "accountStatus">): string {
  if (profile.role === "TEACHER" && profile.accountStatus !== "ACTIVE") {
    return "/pending";
  }

  if (profile.role === "ADMIN") return "/admin";
  if (profile.role === "TEACHER") return "/teacher";

  return "/dashboard";
}
