import Link from "next/link";
import { ArrowUpRight, Clock3, Crosshair, FileCheck2, Shield, Users } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import type { Room } from "@/types/room";

type RoomCardProps = {
  room: Room;
  featured?: boolean;
};

export function RoomCard({ room, featured = false }: RoomCardProps) {
  const isGreen = room.accent === "green";
  const CategoryIcon = room.category === "GRC" ? FileCheck2 : Crosshair;

  return (
    <article
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border bg-[#0d1217] transition-all duration-300 hover:-translate-y-1 ${
        isGreen
          ? "border-emerald-300/10 hover:border-emerald-300/30 hover:shadow-[0_20px_60px_rgba(16,185,129,0.08)]"
          : "border-sky-300/10 hover:border-sky-300/30 hover:shadow-[0_20px_60px_rgba(14,165,233,0.08)]"
      } ${featured ? "min-h-[320px]" : "min-h-[300px]"}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-28 opacity-70 ${
          isGreen
            ? "bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,.18),transparent_65%)]"
            : "bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,.18),transparent_65%)]"
        }`}
      />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.12]" />

      <div className="relative flex items-start justify-between p-5 pb-4 sm:p-6 sm:pb-4">
        <div
          className={`grid size-11 place-items-center rounded-xl border ${
            isGreen
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300"
              : "border-sky-300/20 bg-sky-300/10 text-sky-300"
          }`}
        >
          <CategoryIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.08] bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {room.type}
          </span>
          {room.progress > 0 && <ProgressRing value={room.progress} size={42} accent={room.accent} />}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${isGreen ? "text-emerald-400" : "text-sky-400"}`}>
          {room.path}
        </p>
        <h3 className="text-xl font-semibold tracking-[-0.025em] text-white">{room.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{room.description}</p>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="size-3.5" aria-hidden="true" />
            {room.difficulty}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {room.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {room.learners}
          </span>
        </div>

        <Link
          href={`/rooms/${room.slug}`}
          className={`mt-5 inline-flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 ${
            isGreen
              ? "border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-200 hover:border-emerald-300/35 hover:bg-emerald-300/[0.12] focus-visible:ring-emerald-400"
              : "border-sky-300/15 bg-sky-300/[0.07] text-sky-200 hover:border-sky-300/35 hover:bg-sky-300/[0.12] focus-visible:ring-sky-400"
          }`}
        >
          {room.progress > 0 ? "Davam et" : "Room-a başla"}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
