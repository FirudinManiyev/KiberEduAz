import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin/admin-console";
import { apiFetch } from "@/lib/api/server";
import { requireProfile } from "@/lib/api/viewer";
import type {
  AdminStats,
  AdminUserRow,
  ClassSummary,
  PendingRoom,
  PendingTeacher,
} from "@/lib/api/types";
import { homePathFor } from "@/lib/auth/home-path";

export const metadata: Metadata = {
  title: "Admin paneli",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await requireProfile("/admin");

  if (profile.role !== "ADMIN") redirect(homePathFor(profile));

  const [stats, pendingTeachers, pendingRooms, users, classes] = await Promise.all([
    apiFetch<AdminStats>("/admin/stats"),
    apiFetch<PendingTeacher[]>("/admin/teachers/pending"),
    apiFetch<PendingRoom[]>("/admin/rooms/pending"),
    apiFetch<AdminUserRow[]>("/profiles"),
    apiFetch<ClassSummary[]>("/classes"),
  ]);

  return (
    <main className="flex-1">
      <AdminConsole
        stats={stats}
        pendingTeachers={pendingTeachers}
        pendingRooms={pendingRooms}
        users={users}
        classes={classes}
      />
    </main>
  );
}
