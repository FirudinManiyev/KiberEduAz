import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeacherConsole } from "@/components/teacher/teacher-console";
import { apiFetch } from "@/lib/api/server";
import { requireProfile } from "@/lib/api/viewer";
import type { ClassSummary, PathTreeNode, RoomSummary } from "@/lib/api/types";
import { homePathFor } from "@/lib/auth/home-path";

export const metadata: Metadata = {
  title: "Müəllim paneli",
  robots: { index: false, follow: false },
};

export default async function TeacherPage() {
  const profile = await requireProfile("/teacher");

  if (profile.role !== "TEACHER" || profile.accountStatus !== "ACTIVE") {
    redirect(homePathFor(profile));
  }

  const [paths, rooms, classes] = await Promise.all([
    apiFetch<PathTreeNode[]>("/paths"),
    apiFetch<RoomSummary[]>("/rooms"),
    apiFetch<ClassSummary[]>("/classes"),
  ]);

  return (
    <main className="flex-1">
      <TeacherConsole
        profile={profile}
        initialPaths={paths}
        initialRooms={rooms}
        initialClasses={classes}
      />
    </main>
  );
}
