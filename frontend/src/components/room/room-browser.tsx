"use client";

import { Search, ShieldX } from "lucide-react";
import { useMemo, useState } from "react";
import { RoomCard } from "@/components/room/room-card";
import { ProgressiveDisclosure } from "@/components/ui/progressive-disclosure";
import type { LearningRoomSummary } from "@/lib/content/types";
import { getProgressiveListState } from "@/lib/ui/progressive-list";

type RoomBrowserProps = {
  rooms: LearningRoomSummary[];
};

const ALL = "Hamısı";

export function RoomBrowser({ rooms }: RoomBrowserProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(ALL);
  const [expanded, setExpanded] = useState(false);

  // Categories come from the content itself, so a new Path added by a teacher
  // shows up here without a code change.
  const filters = useMemo(
    () => [ALL, ...Array.from(new Set(rooms.map((room) => room.category))).filter(Boolean).sort()],
    [rooms],
  );

  const visibleRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("az");

    return rooms.filter((room) => {
      const matchesFilter = filter === ALL || room.category === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [room.title, room.shortTitle, room.description, room.path, room.module, room.track]
          .join(" ")
          .toLocaleLowerCase("az")
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, rooms]);
  const list = getProgressiveListState(visibleRooms, expanded);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-300/10 bg-[#1a1d20] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="room-search" className="sr-only">Room axtar</label>
          <input
            id="room-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
            placeholder="Mövzu və ya Room axtar..."
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-300/10"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/20 p-1" role="group" aria-label="Room kateqoriyası">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter(item);
                setExpanded(false);
              }}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                filter === item
                  ? "bg-white/[0.09] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <span>
          {visibleRooms.length} Room tapıldı
          {list.canToggle ? ` · ${list.visibleItems.length} göstərilir` : ""}
        </span>
        <span>Məzmun səviyyəsinə görə sıralanıb</span>
      </div>

      {visibleRooms.length > 0 ? (
        <div data-room-grid="three-column" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.visibleItems.map((room) => (
            <RoomCard key={room.slug} room={room} compact />
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-slate-500">
              <ShieldX className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-200">Uyğun Room tapılmadı</h2>
            <p className="mt-2 text-sm text-slate-500">Axtarış sözünü və ya filtri dəyişərək yenidən yoxla.</p>
          </div>
        </div>
      )}

      {visibleRooms.length > 0 && list.canToggle && (
        <ProgressiveDisclosure
          expanded={expanded}
          hiddenCount={list.hiddenCount}
          onToggle={() => setExpanded((current) => !current)}
        />
      )}
    </div>
  );
}
