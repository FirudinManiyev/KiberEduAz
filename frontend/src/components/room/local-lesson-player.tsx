"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileText,
  HardDrive,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LessonMarkdown } from "@/components/room/lesson-markdown";
import {
  LOCAL_PROGRESS_KEY,
  completeLocalTask,
  emptyLocalProgress,
  parseLocalProgress,
  serializeLocalProgress,
  setLastVisitedTask,
  solveLocalQuestion,
  type LocalProgressState,
} from "@/lib/content/local-progress";
import type { LocalRoomDetail } from "@/lib/content/types";

export function LocalLessonPlayer({ room }: { room: LocalRoomDetail }) {
  const [progressState, setProgressState] = useState<LocalProgressState>(emptyLocalProgress);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let stored = emptyLocalProgress();
    try {
      stored = parseLocalProgress(window.localStorage.getItem(LOCAL_PROGRESS_KEY));
    } catch {
      // Private browsing can deny storage; the in-memory path still works.
    }

    const lastTaskId = stored.rooms[room.slug]?.lastTaskId;
    const lastTaskIndex = room.tasks.findIndex((task) => task.id === lastTaskId);

    // This is an intentional client-only hydration from browser storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressState(stored);
    setCurrentTaskIndex(lastTaskIndex >= 0 ? lastTaskIndex : 0);
    setReady(true);
  }, [room.slug, room.tasks]);

  const roomProgress = progressState.rooms[room.slug];
  const completedTaskIds = roomProgress?.completedTaskIds ?? [];
  const solvedQuestionIds = roomProgress?.solvedQuestionIds ?? [];
  const earnedPoints = roomProgress?.earnedPoints ?? 0;
  const progress = room.tasks.length
    ? Math.round((completedTaskIds.length / room.tasks.length) * 100)
    : 0;
  const currentTask = room.tasks[currentTaskIndex];
  const currentCompleted = currentTask ? completedTaskIds.includes(currentTask.id) : false;
  const isLastTask = currentTaskIndex === room.tasks.length - 1;
  const completionPoints = useMemo(
    () =>
      currentTask
        ? Math.max(
            0,
            currentTask.points - currentTask.questions.reduce((sum, question) => sum + question.points, 0),
          )
        : 0,
    [currentTask],
  );

  function persist(next: LocalProgressState) {
    setProgressState(next);
    try {
      window.localStorage.setItem(LOCAL_PROGRESS_KEY, serializeLocalProgress(next));
    } catch {
      // Keep progress for the current page even if browser storage is unavailable.
    }
  }

  function goToTask(index: number) {
    const task = room.tasks[index];
    if (!task) return;
    setCurrentTaskIndex(index);
    persist(setLastVisitedTask(progressState, room.slug, task.id));
    document.getElementById("local-lesson-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function markQuestion(questionId: string, points: number) {
    if (!currentTask || solvedQuestionIds.includes(questionId) || pendingId) return;
    setPendingId(questionId);
    window.setTimeout(() => {
      persist(
        solveLocalQuestion(progressState, room.slug, currentTask.id, questionId, points),
      );
      setPendingId(null);
    }, 260);
  }

  function markTaskComplete() {
    if (!currentTask || currentCompleted || pendingId) return;
    setPendingId(currentTask.id);
    window.setTimeout(() => {
      persist(completeLocalTask(progressState, room.slug, currentTask.id, completionPoints));
      setPendingId(null);
    }, 320);
  }

  if (!currentTask) return null;

  return (
    <section className="border-t border-red-300/[0.08] bg-[#15181a]" aria-labelledby="local-lesson-heading">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-amber-200/[0.055] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-amber-100">
              <HardDrive className="size-3.5" aria-hidden="true" />
              Bu cihazda saxlanılır
            </div>
            <h2 id="local-lesson-heading" className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
              Dərs + interaktiv yoxlama
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:min-w-64">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Room progress</span>
                <span className="font-semibold text-emerald-300">{ready ? progress : "—"}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-400 transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="font-mono text-xs text-slate-500">{completedTaskIds.length}/{room.tasks.length}</span>
          </div>
        </div>

        <div className="grid min-w-0 overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d20] shadow-[0_30px_100px_rgba(0,0,0,.16)] lg:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-white/[0.07] bg-[#171a1d] lg:border-r lg:border-b-0" aria-label="Room taskları">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-300"><BookOpen className="size-4 text-emerald-400" />Room məzmunu</span>
              <span className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-500">{room.tasks.length} task</span>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible">
              {room.tasks.map((task, index) => {
                const completed = completedTaskIds.includes(task.id);
                const active = index === currentTaskIndex;
                return (
                  <button key={task.id} type="button" onClick={() => goToTask(index)} className={`group flex min-w-60 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all lg:w-full lg:min-w-0 ${active ? "border-emerald-300/18 bg-emerald-300/[0.07]" : "border-transparent hover:border-white/[0.055] hover:bg-white/[0.025]"}`} aria-current={active ? "step" : undefined}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${completed ? "bg-emerald-400 text-emerald-950" : active ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-300" : "border border-white/[0.08] text-slate-600"}`}>
                      {completed ? <Check className="size-4" /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-semibold ${active ? "text-slate-100" : "text-slate-400"}`}>{task.title}</span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-600"><Clock3 className="size-3" />{task.durationLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="hidden border-t border-white/[0.07] p-5 lg:block">
              <div className="rounded-xl border border-violet-300/10 bg-violet-300/[0.045] p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-violet-200"><Award className="size-4" />Room mükafatı</p>
                <p className="mt-3 font-mono text-sm font-bold text-violet-300">{earnedPoints}/{room.points} XP</p>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:px-8">
              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                <FileText className="size-4 shrink-0 text-slate-400" />
                <span className="shrink-0">Task {currentTaskIndex + 1}</span><span>/</span><span className="truncate">{currentTask.title}</span>
              </div>
            </div>

            <article className="mx-auto min-w-0 max-w-4xl px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Task {String(currentTaskIndex + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{currentTask.title}</h3>
              <div className="mt-8"><LessonMarkdown>{currentTask.markdown}</LessonMarkdown></div>

              {currentTask.questions.length > 0 ? (
                <div className="mt-10 space-y-4">
                  {currentTask.questions.map((question) => {
                    const solved = solvedQuestionIds.includes(question.id);
                    const pending = pendingId === question.id;
                    return (
                      <section key={question.id} className={`rounded-2xl border p-5 transition-all sm:p-6 ${solved ? "border-emerald-300/18 bg-emerald-300/[0.055]" : "border-red-300/15 bg-red-300/[0.035] hover:border-red-300/25"}`}>
                        <div className="flex items-start gap-3">
                          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${solved ? "bg-emerald-300/10 text-emerald-300" : "bg-red-300/10 text-red-300"}`}><Lightbulb className="size-[18px]" /></span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-red-300">Özünü yoxla</p>
                            <h4 className="mt-2 text-base font-semibold leading-6 text-slate-100">{question.prompt}</h4>
                            {question.format && <p className="mt-2 text-xs text-slate-500">Cavab formatı: {question.format}</p>}
                          </div>
                        </div>
                        <button type="button" disabled={solved || pending} onClick={() => markQuestion(question.id, question.points)} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 text-xs font-semibold text-slate-200 transition-all hover:-translate-y-0.5 hover:border-emerald-300/25 hover:text-emerald-200 disabled:cursor-default disabled:opacity-70">
                          {pending ? <><Loader2 className="size-3.5 animate-spin" />Cavab yoxlanılır…</> : solved ? <><CheckCircle2 className="size-3.5 text-emerald-300" />Yoxlama tamamlandı</> : <><Sparkles className="size-3.5" />Anladım, qeyd et</>}
                        </button>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-10 rounded-2xl border border-amber-200/12 bg-amber-200/[0.035] p-5 text-sm leading-6 text-amber-50/75">
                  Əsas anlayışları öz sözlərinlə izah et. Hazır olduqda taskı tamamlanmış kimi qeyd et.
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => goToTask(Math.max(0, currentTaskIndex - 1))} disabled={currentTaskIndex === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-35"><ChevronLeft className="size-4" />Əvvəlki task</button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {!currentCompleted && (
                    <button type="button" onClick={markTaskComplete} disabled={pendingId !== null} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-red-400 disabled:opacity-60">
                      {pendingId === currentTask.id ? <><Loader2 className="size-4 animate-spin" />Progress saxlanılır…</> : <><Check className="size-4" />Taskı tamamla</>}
                    </button>
                  )}
                  {currentCompleted && !isLastTask && (
                    <button type="button" onClick={() => goToTask(currentTaskIndex + 1)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-emerald-950 transition-all hover:-translate-y-0.5 hover:bg-emerald-300">Növbəti task<ArrowRight className="size-4" /></button>
                  )}
                  {currentCompleted && isLastTask && progress === 100 && (
                    <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] px-5 text-sm font-bold text-emerald-200"><CheckCircle2 className="size-4" />Room tamamlandı</span>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

