import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LessonPlayer } from "@/components/room/lesson-player";
import { LocalLessonPlayer } from "@/components/room/local-lesson-player";
import { ApiError, apiFetch } from "@/lib/api/server";
import { DIFFICULTY_LABELS, ROOM_TYPE_LABELS } from "@/lib/api/labels";
import type { RoomDetail } from "@/lib/api/types";
import { loadLocalRoom } from "@/lib/content/markdown";
import { decorateApiRoomDetail } from "@/lib/content/rooms";
import type { LearningRoomDetail } from "@/lib/content/types";

type RoomPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadRoom(slug: string): Promise<LearningRoomDetail> {
  const localRoom = await loadLocalRoom(slug);
  if (localRoom) return localRoom;

  try {
    const apiRoom = await apiFetch<RoomDetail>(`/rooms/${encodeURIComponent(slug)}`);
    return decorateApiRoomDetail(apiRoom);
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) notFound();
    throw cause;
  }
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const localRoom = await loadLocalRoom(slug);
  if (localRoom) return { title: localRoom.title, description: localRoom.description };

  try {
    const room = await apiFetch<RoomDetail>(`/rooms/${encodeURIComponent(slug)}`);

    return { title: room.title, description: room.description };
  } catch {
    return {};
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const room = await loadRoom(slug);

  const isGreen = room.accent === "GREEN";

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 -z-10 ${isGreen ? "room-glow-green" : "room-glow-red"}`} />
        <div className="cyber-grid absolute inset-0 -z-10 opacity-[0.13]" />
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-11 lg:px-10 lg:py-14">
          <Link href="/rooms" className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-white">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Room kitabxanasına qayıt
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] ${isGreen ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300" : "border-red-300/20 bg-red-300/[0.08] text-red-300"}`}>
                  {ROOM_TYPE_LABELS[room.type]}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                  {DIFFICULTY_LABELS[room.difficulty]}
                </span>
              </div>

              <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.16em] ${isGreen ? "text-emerald-400" : "text-red-400"}`}>
                {room.eyebrow}
              </p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-[56px]">
                {room.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                {room.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2"><Clock3 className="size-4" aria-hidden="true" />{room.durationLabel}</span>
                <span className="inline-flex items-center gap-2"><BookOpenCheck className="size-4" aria-hidden="true" />{room.tasks.length} task</span>
                <span className="inline-flex items-center gap-2"><TrendingUp className="size-4" aria-hidden="true" />{room.progress.percent}% tamamlanıb</span>
                <span className={`inline-flex items-center gap-2 font-semibold ${isGreen ? "text-emerald-300" : "text-red-300"}`}><Zap className="size-4" aria-hidden="true" />{room.points} XP</span>
              </div>
            </div>

            <aside className="overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d20]/90 shadow-2xl backdrop-blur">
              <div className="relative aspect-[16/9] overflow-hidden border-b border-white/[0.07] bg-[#111416]">
                <Image
                  src={room.image}
                  alt={room.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171a1d] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-[#121416]/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-200 backdrop-blur">
                  {room.progressMode === "local" ? "Bu cihazda saxlanılır" : "Hesabla sinxronlaşır"}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Path / Module</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-200">{room.path.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{room.module.title}</p>
                </div>
                <span className={`grid size-11 place-items-center rounded-xl border ${isGreen ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : "border-red-300/20 bg-red-300/10 text-red-300"}`}>
                  <Shield className="size-5" aria-hidden="true" />
                </span>
              </div>

                <div className="my-5 h-px bg-white/[0.07]" />
                <p className="text-xs font-semibold text-slate-300">Bu Room-dan sonra bacaracaqsan:</p>
                <ul className="mt-3 space-y-2.5">
                  {room.objectives.map((objective) => (
                    <li key={objective} className="flex gap-2.5 text-xs leading-5 text-slate-500">
                      <CheckCircle2 className={`mt-0.5 size-3.5 shrink-0 ${isGreen ? "text-emerald-400" : "text-red-400"}`} aria-hidden="true" />
                      {objective}
                    </li>
                  ))}
                </ul>

                {room.sourceFile && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/15 px-3 py-2.5 text-[10px] text-slate-600">
                    <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                    Mənbə: {room.sourceFile}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {room.progressMode === "local" ? <LocalLessonPlayer room={room} /> : <LessonPlayer room={room} />}
    </main>
  );
}
