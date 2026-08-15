import type { Metadata } from "next";
import { AlertTriangle, BookOpenCheck, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { RoomBrowser } from "@/components/room/room-browser";
import { apiFetchOrNull } from "@/lib/api/server";
import type { RoomSummary } from "@/lib/api/types";
import { mergeRoomSummaries } from "@/lib/content/rooms";

export const metadata: Metadata = {
  title: "Room-lar",
  description: "KiberEduAz praktiki kibertəhlükəsizlik Room-ları və təlim məzmunları.",
};

export default async function RoomsPage() {
  const apiRooms = await apiFetchOrNull<RoomSummary[]>("/rooms");
  const rooms = mergeRoomSummaries(apiRooms ?? []);

  const totalTasks = rooms.reduce((sum, room) => sum + room.taskCount, 0);
  const earnedPoints = rooms.reduce((sum, room) => sum + room.progress.pointsEarned, 0);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="hero-glow absolute inset-0 -z-10 opacity-70" />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" />
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-300/15 bg-red-300/[0.06] px-3 py-1.5 text-xs font-semibold text-red-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Təlim kitabxanası
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Öz missiyanı seç</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Hər Room nəzəri izahı, ssenari əsaslı tapşırığı və ani yoxlamanı vahid öyrənmə axınında birləşdirir.
            </p>
          </div>

          <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              {
                label: "Aktiv Room",
                value: String(rooms.length).padStart(2, "0"),
                icon: Layers3,
                tone: "text-emerald-300",
              },
              { label: "Praktiki task", value: String(totalTasks), icon: BookOpenCheck, tone: "text-red-300" },
              {
                label: "Qazandığın XP",
                value: earnedPoints.toLocaleString("az-AZ"),
                icon: ShieldCheck,
                tone: "text-violet-300",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-white/[0.07] bg-black/15 p-4 backdrop-blur-sm">
                  <Icon className={`size-4 ${item.tone}`} aria-hidden="true" />
                  <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14" aria-label="Room kataloqu">
        {apiRooms === null && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.055] p-4 text-xs leading-5 text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              Hesabla sinxronlaşan Room-lar hazırda yüklənmədi. Bu cihazda işləyən beş yeni dərsə davam edə bilərsən.
            </p>
          </div>
        )}
        <RoomBrowser rooms={rooms} />
      </section>
    </main>
  );
}
