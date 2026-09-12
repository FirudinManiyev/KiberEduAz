import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RoomContentEditor } from "@/components/teacher/room-content-editor";
import { ApiError, apiFetch } from "@/lib/api/server";
import { requireProfile } from "@/lib/api/viewer";
import type { RoomDetailForAuthor } from "@/lib/api/types";
import { homePathFor } from "@/lib/auth/home-path";

export const metadata: Metadata = {
  title: "Room məzmunu",
  robots: { index: false, follow: false },
};

export default async function RoomEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile(`/teacher/rooms/${id}`);

  if (profile.role === "STUDENT") redirect(homePathFor(profile));
  if (profile.role === "TEACHER" && profile.accountStatus !== "ACTIVE") redirect("/pending");

  let room: RoomDetailForAuthor;

  try {
    // The API answers 403 for a room this teacher does not own and 404 for one
    // that is not there; neither should look like a crash.
    room = await apiFetch<RoomDetailForAuthor>(`/rooms/${id}/edit`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }

  return (
    <main className="flex-1">
      <RoomContentEditor room={room} />
    </main>
  );
}
