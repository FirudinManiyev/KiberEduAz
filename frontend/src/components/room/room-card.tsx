import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Crosshair, FileCheck2, ListChecks, Shield, Zap } from "lucide-react";
import { LinkLoadingIndicator } from "@/components/feedback/link-loading-indicator";
import { ProgressRing } from "@/components/ui/progress-ring";
import { DIFFICULTY_LABELS, ROOM_TYPE_LABELS } from "@/lib/api/labels";
import type { RoomSummary } from "@/lib/api/types";
import { resolveRoomArtwork } from "@/lib/content/room-artwork";
import type { LearningRoomSummary } from "@/lib/content/types";

type RoomCardProps = {
  room: RoomSummary | LearningRoomSummary;
  featured?: boolean;
};

export function RoomCard({ room, featured = false }: RoomCardProps) {
  const isGreen = room.accent === "GREEN";
  const CategoryIcon = room.category === "GRC" ? FileCheck2 : Crosshair;
  const percent = room.progress.percent;
  const presentation = "image" in room ? room : resolveRoomArtwork(room);
  const image = presentation.image;
  const imageAlt = presentation.imageAlt;
  const progressMode = "progressMode" in room ? room.progressMode : "api";

  return (
    <article
      className={`interactive-card group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border bg-[#1a1d1f] transition-all duration-500 ${
        isGreen
          ? "border-emerald-300/10 hover:border-emerald-300/35 hover:shadow-[0_24px_80px_rgba(16,185,129,0.1)]"
          : "border-red-300/10 hover:border-red-300/35 hover:shadow-[0_24px_80px_rgba(239,68,68,0.1)]"
      } ${featured ? "min-h-[330px]" : "min-h-[310px]"}`}
    >
      <div className="relative aspect-[16/8.4] overflow-hidden border-b border-white/[0.06] bg-[#111416]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.06] group-hover:saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d1f] via-[#1a1d1f]/10 to-black/10" />
        <span className={`absolute left-4 top-4 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] backdrop-blur ${progressMode === "local" ? "border-amber-200/20 bg-amber-200/10 text-amber-100" : "border-emerald-200/20 bg-emerald-200/10 text-emerald-100"}`}>
          {progressMode === "local" ? "Bu cihazda" : "Sinxron"}
        </span>
      </div>

      <div className={`card-radar ${isGreen ? "card-radar--green" : "card-radar--red"}`} />
      <div className="card-scanline" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.1] transition-opacity duration-500 group-hover:opacity-[0.2]" />

      <div className="relative flex items-start justify-between p-5 pb-4 sm:px-6 sm:pt-5 sm:pb-4">
        <div className={`room-icon-shell ${isGreen ? "room-icon-shell--green" : "room-icon-shell--red"}`}>
          <CategoryIcon className="size-5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" aria-hidden="true" />
          <span className="room-icon-shell__ring" />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.08] bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-colors group-hover:border-white/[0.14] group-hover:text-slate-200">
            {ROOM_TYPE_LABELS[room.type]}
          </span>
          {percent > 0 && <ProgressRing value={percent} size={42} accent={isGreen ? "green" : "red"} />}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${isGreen ? "text-emerald-400" : "text-red-400"}`}>
          {room.path}
        </p>
        <h3 className="text-xl font-semibold tracking-[-0.025em] text-white transition-transform duration-500 group-hover:translate-x-1">{room.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400 transition-colors group-hover:text-slate-300">{room.description}</p>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><Shield className="size-3.5" aria-hidden="true" />{DIFFICULTY_LABELS[room.difficulty]}</span>
          <span className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><Clock3 className="size-3.5" aria-hidden="true" />{room.durationLabel}</span>
          <span className="inline-flex items-center gap-1.5 transition-colors hover:text-white"><ListChecks className="size-3.5" aria-hidden="true" />{room.taskCount} task</span>
          <span className={`ml-auto inline-flex items-center gap-1 font-semibold ${isGreen ? "text-emerald-300" : "text-red-300"}`}><Zap className="size-3.5" />{room.points} XP</span>
        </div>

        <Link
          href={`/rooms/${room.slug}`}
          prefetch
          className={`relative mt-5 inline-flex items-center justify-between overflow-hidden rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ${
            isGreen
              ? "border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-200 hover:border-emerald-300/40 hover:bg-emerald-300/[0.13] focus-visible:ring-emerald-400"
              : "border-red-300/15 bg-red-300/[0.07] text-red-200 hover:border-red-300/40 hover:bg-red-300/[0.13] focus-visible:ring-red-400"
          }`}
        >
          <span className="relative z-10">{percent > 0 ? "Davam et" : "Room-a başla"}</span>
          <span className="relative z-10 flex items-center gap-2">
            <LinkLoadingIndicator />
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
          <span className="button-sheen" />
        </Link>
      </div>
    </article>
  );
}
