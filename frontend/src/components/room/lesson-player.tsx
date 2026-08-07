"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock3,
  FileText,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Room } from "@/types/room";

type LessonPlayerProps = {
  room: Room;
};

export function LessonPlayer({ room }: LessonPlayerProps) {
  const initialCompletedCount = Math.floor((room.progress / 100) * room.tasks.length);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(
    Math.min(initialCompletedCount, room.tasks.length - 1),
  );
  const [completedTasks, setCompletedTasks] = useState<number[]>(() =>
    room.tasks.slice(0, initialCompletedCount).map((task) => task.id),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentTask = room.tasks[currentTaskIndex];
  const isCurrentCompleted = completedTasks.includes(currentTask.id);
  const answerIsCorrect = selectedAnswer === currentTask.question.correctAnswer;
  const progress = Math.round((completedTasks.length / room.tasks.length) * 100);

  function goToTask(index: number) {
    const task = room.tasks[index];
    setCurrentTaskIndex(index);
    setSelectedAnswer(
      completedTasks.includes(task.id) ? task.question.correctAnswer : null,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseAnswer(index: number) {
    setSelectedAnswer(index);

    if (index === currentTask.question.correctAnswer) {
      setCompletedTasks((current) =>
        current.includes(currentTask.id) ? current : [...current, currentTask.id],
      );
    }
  }

  function resetQuestion() {
    if (!isCurrentCompleted) setSelectedAnswer(null);
  }

  function goToNextTask() {
    if (currentTaskIndex < room.tasks.length - 1) {
      goToTask(currentTaskIndex + 1);
    }
  }

  return (
    <section className="border-t border-red-300/[0.08] bg-[#15181a]" aria-labelledby="lesson-heading">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">İnteqrasiya olunmuş öyrənmə axını</p>
            <h2 id="lesson-heading" className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">
              Dərs + praktiki yoxlama
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:min-w-64">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Room progress</span>
                <span className="font-semibold text-emerald-300">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {completedTasks.length}/{room.tasks.length}
            </span>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-red-300/10 bg-[#1a1d20] shadow-[0_30px_100px_rgba(0,0,0,.16)] lg:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="border-b border-white/[0.07] bg-[#171a1d] lg:border-r lg:border-b-0" aria-label="Room taskları">
            <div className="border-b border-white/[0.07] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <BookOpen className="size-4 text-emerald-400" aria-hidden="true" />
                  Room məzmunu
                </div>
                <span className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-500">
                  {room.tasks.length} task
                </span>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible">
              {room.tasks.map((task, index) => {
                const completed = completedTasks.includes(task.id);
                const active = currentTaskIndex === index;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(index)}
                    className={`group flex min-w-60 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all lg:min-w-0 lg:w-full ${
                      active
                        ? "border-emerald-300/18 bg-emerald-300/[0.07]"
                        : "border-transparent hover:border-white/[0.055] hover:bg-white/[0.025]"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold transition-colors ${
                        completed
                          ? "bg-emerald-400 text-emerald-950"
                          : active
                            ? "border border-emerald-300/25 bg-emerald-300/10 text-emerald-300"
                            : "border border-white/[0.08] bg-white/[0.025] text-slate-600 group-hover:text-slate-400"
                      }`}
                    >
                      {completed ? <Check className="size-4" aria-hidden="true" /> : String(task.id).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-semibold ${active ? "text-slate-100" : "text-slate-400"}`}>
                        {task.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {task.duration}
                      </span>
                    </span>
                    {active && <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
                  </button>
                );
              })}
            </div>

            <div className="hidden border-t border-white/[0.07] p-5 lg:block">
              <div className="rounded-xl border border-violet-300/10 bg-violet-300/[0.045] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-200">
                  <Award className="size-4" aria-hidden="true" />
                  Room mükafatı
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">Bütün taskları bitir və hesabına əlavə et.</p>
                <p className="mt-3 font-mono text-sm font-bold text-violet-300">+{room.points} XP</p>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                  <FileText className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate">Task {currentTask.id}</span>
                  <span aria-hidden="true">/</span>
                  <span className="truncate">{currentTask.title}</span>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-slate-500">
                  {currentTask.duration}
                </span>
              </div>
            </div>

            <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                Task {String(currentTask.id).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {currentTask.title}
              </h3>

              <div className="lesson-copy mt-8 space-y-7">
                {currentTask.sections.map((section, index) => (
                  <section key={`${currentTask.id}-${index}`}>
                    {section.heading && <h4>{section.heading}</h4>}
                    <p>{section.body}</p>
                    {section.bullets && (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-red-300/15 bg-red-300/[0.035] p-5 transition-all duration-300 hover:border-red-300/25 hover:bg-red-300/[0.05] sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-300/10 text-red-300">
                    <Lightbulb className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-300">Bilik yoxlaması</p>
                    <h4 className="mt-2 text-base font-semibold leading-6 text-slate-100 sm:text-lg">
                      {currentTask.question.prompt}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 grid gap-2.5">
                  {currentTask.question.options.map((option, index) => {
                    const selected = selectedAnswer === index;
                    const isCorrectOption = index === currentTask.question.correctAnswer;
                    const showCorrect = selectedAnswer !== null && isCorrectOption && answerIsCorrect;
                    const showWrong = selected && !isCorrectOption;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => chooseAnswer(index)}
                        disabled={answerIsCorrect}
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all disabled:cursor-default ${
                          showCorrect
                            ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
                            : showWrong
                              ? "border-rose-300/30 bg-rose-300/[0.07] text-rose-100"
                              : selected
                                ? "border-red-300/30 bg-red-300/[0.07] text-slate-100"
                                : "border-white/[0.07] bg-black/15 text-slate-400 hover:border-white/[0.14] hover:bg-white/[0.035] hover:text-slate-200"
                        }`}
                      >
                        <span className={`grid size-7 shrink-0 place-items-center rounded-lg border text-[11px] font-bold ${
                          showCorrect
                            ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-300"
                            : showWrong
                              ? "border-rose-300/30 bg-rose-300/10 text-rose-300"
                              : "border-white/[0.09] bg-white/[0.025] text-slate-500"
                        }`}>
                          {showCorrect ? <Check className="size-4" /> : showWrong ? <X className="size-4" /> : String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {selected ? <CheckCircle2 className="size-4 opacity-60" aria-hidden="true" /> : <Circle className="size-3.5 opacity-30" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <div
                    className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${
                      answerIsCorrect
                        ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-100"
                        : "border-rose-300/15 bg-rose-300/[0.045] text-rose-100"
                    }`}
                    role="status"
                  >
                    <p className="font-semibold">{answerIsCorrect ? "Düzgün cavab!" : "Bir daha düşün."}</p>
                    <p className="mt-1 text-xs leading-5 opacity-75">
                      {answerIsCorrect
                        ? currentTask.question.explanation
                        : "Mətndəki əsas anlayışa yenidən bax və başqa variantı sına."}
                    </p>
                    {!answerIsCorrect && (
                      <button type="button" onClick={resetQuestion} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold underline decoration-white/25 underline-offset-4 hover:decoration-white/60">
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Yenidən cəhd et
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => goToTask(Math.max(0, currentTaskIndex - 1))}
                  disabled={currentTaskIndex === 0}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Əvvəlki task
                </button>

                {(answerIsCorrect || isCurrentCompleted) && currentTaskIndex < room.tasks.length - 1 && (
                  <button
                    type="button"
                    onClick={goToNextTask}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-emerald-950 transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Növbəti task
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                )}

                {(answerIsCorrect || isCurrentCompleted) && currentTaskIndex === room.tasks.length - 1 && (
                  <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.08] px-5 text-sm font-semibold text-violet-200">
                    <Sparkles className="size-4" aria-hidden="true" />
                    Room tamamlandı · +{room.points} XP
                  </div>
                )}

                {!answerIsCorrect && !isCurrentCompleted && (
                  <p className="inline-flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Target className="size-4" aria-hidden="true" />
                    Davam etmək üçün düzgün cavabı tap
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
