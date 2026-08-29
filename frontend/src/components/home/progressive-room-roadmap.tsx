"use client";

import Link from "next/link";
import { ChevronRight, Clock3 } from "lucide-react";
import { useState } from "react";
import { ProgressiveDisclosure } from "@/components/ui/progressive-disclosure";
import type { RoomSummary } from "@/lib/api/types";
import { getProgressiveListState } from "@/lib/ui/progressive-list";

type ProgressiveRoomRoadmapProps = {
  rooms: RoomSummary[];
};

export function ProgressiveRoomRoadmap({ rooms }: ProgressiveRoomRoadmapProps) {
  const [expanded, setExpanded] = useState(false);
  const list = getProgressiveListState(rooms, expanded);

  return (
    <>
      {list.visibleItems.map((room, index) => (
        <Link
          key={room.slug}
          href={`/rooms/${room.slug}`}
          prefetch
          className="road-node group relative flex items-center gap-4 rounded-xl border border-white/[0.065] bg-white/[0.02] p-4 transition-all hover:translate-x-1 hover:border-white/[0.13] hover:bg-white/[0.04]"
        >
          <span
            className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-xl border text-xs font-bold ${
              room.progress.status === "COMPLETED"
                ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
                : "border-red-300/25 bg-red-300/10 text-red-300"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-600">
              {room.module}
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-slate-200">{room.title}</span>
          </span>
          <span className="hidden items-center gap-1.5 text-[10px] text-slate-600 sm:flex">
            <Clock3 className="size-3" aria-hidden="true" />
            {room.durationLabel}
          </span>
          <ChevronRight className="size-4 text-slate-700 transition-all group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
        </Link>
      ))}

      {list.canToggle && (
        <ProgressiveDisclosure
          expanded={expanded}
          hiddenCount={list.hiddenCount}
          onToggle={() => setExpanded((current) => !current)}
          className="w-full"
        />
      )}
    </>
  );
}

