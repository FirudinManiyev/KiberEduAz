"use client";

import {
  AlertTriangle,
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
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import type { AnswerResult, RoomDetail } from "@/lib/api/types";

type LessonPlayerProps = {
  room: RoomDetail;
};

/// What the learner currently knows about a question. `wrongOptionId` is local
/// UI state; the server never tells us which other options are wrong.
type QuestionState = {
  solved: boolean;
  explanation: string | null;
  selectedOptionId: string | null;
  wrongOptionId: string | null;
  pending: boolean;
  error: string | null;
};

function initialQuestionStates(room: RoomDetail): Record<string, QuestionState> {
  const states: Record<string, QuestionState> = {};

  for (const task of room.tasks) {
    for (const question of task.questions) {
      states[question.id] = {
        solved: question.solved,
        explanation: question.explanation,
        selectedOptionId: null,
        wrongOptionId: null,
        pending: false,
        error: null,
      };
    }
  }

  return states;
}

export function LessonPlayer({ room }: LessonPlayerProps) {
  const firstUnfinished = room.tasks.findIndex((task) => !task.completed);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(
    firstUnfinished === -1 ? Math.max(room.tasks.length - 1, 0) : firstUnfinished,
  );
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() =>
    room.tasks.filter((task) => task.completed).map((task) => task.id),
  );
  const [questionStates, setQuestionStates] = useState(() => initialQuestionStates(room));
  const [earnedPoints, setEarnedPoints] = useState(room.progress.pointsEarned);

  const currentTask = room.tasks[currentTaskIndex];
  const progress = room.tasks.length
    ? Math.round((completedTaskIds.length / room.tasks.length) * 100)
    : 0;
  const currentCompleted = currentTask ? completedTaskIds.includes(currentTask.id) : false;
  const isLastTask = currentTaskIndex === room.tasks.length - 1;

  function patchQuestion(questionId: string, patch: Partial<QuestionState>) {
    setQuestionStates((current) => ({
      ...current,
      [questionId]: { ...current[questionId], ...patch },
    }));
  }

  function goToTask(index: number) {
    setCurrentTaskIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function chooseAnswer(questionId: string, optionId: string) {
    const state = questionStates[questionId];

    if (state?.solved || state?.pending) return;

    patchQuestion(questionId, {
      selectedOptionId: optionId,
      pending: true,
      error: null,
      wrongOptionId: null,
    });

    try {
      const result = await apiRequest<AnswerResult>(
        `/progress/questions/${questionId}/answer`,
        { method: "POST", body: JSON.stringify({ optionId }) },
      );

      patchQuestion(questionId, {
        solved: result.isCorrect,
        explanation: result.explanation,
        wrongOptionId: result.isCorrect ? null : optionId,
        pending: false,
      });

      setEarnedPoints(result.room.pointsEarned);

      if (result.task.completed) {
        setCompletedTaskIds((current) =>
          current.includes(result.task.id) ? current : [...current, result.task.id],
        );
      }
    } catch (cause) {
      patchQuestion(questionId, {
        pending: false,
        selectedOptionId: null,
        error: cause instanceof Error ? cause.message : "Cavab göndərilə bilmədi",
      });
    }
  }

  function resetQuestion(questionId: string) {
    patchQuestion(questionId, { selectedOptionId: null, wrongOptionId: null, error: null });
  }

  if (!currentTask) {
    return (
      <section className="border-t border-red-300/[0.08] bg-[#15181a]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center text-sm text-slate-500 sm:px-6 lg:px-10">
          Bu Room-a hələ task əlavə edilməyib.
        </div>
      </section>
    );
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
              {completedTaskIds.length}/{room.tasks.length}
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
                const completed = completedTaskIds.includes(task.id);
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
                      {completed ? <Check className="size-4" aria-hidden="true" /> : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-semibold ${active ? "text-slate-100" : "text-slate-400"}`}>
                        {task.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock3 className="size-3" aria-hidden="true" />
                        {task.durationLabel}
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
                <p className="mt-3 font-mono text-sm font-bold text-violet-300">
                  {earnedPoints}/{room.points} XP
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border-b border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                  <FileText className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate">Task {currentTaskIndex + 1}</span>
                  <span aria-hidden="true">/</span>
                  <span className="truncate">{currentTask.title}</span>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-slate-500">
                  {currentTask.durationLabel}
                </span>
              </div>
            </div>

            <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                Task {String(currentTaskIndex + 1).padStart(2, "0")}
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

              {currentTask.questions.map((question) => {
                const state = questionStates[question.id];

                return (
                  <div
                    key={question.id}
                    className="mt-10 rounded-2xl border border-red-300/15 bg-red-300/[0.035] p-5 transition-all duration-300 hover:border-red-300/25 hover:bg-red-300/[0.05] sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-300/10 text-red-300">
                        <Lightbulb className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-300">Bilik yoxlaması</p>
                        <h4 className="mt-2 text-base font-semibold leading-6 text-slate-100 sm:text-lg">
                          {question.prompt}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2.5">
                      {question.options.map((option, index) => {
                        const selected = state?.selectedOptionId === option.id;
                        const showCorrect = state?.solved && selected;
                        const showWrong = state?.wrongOptionId === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => chooseAnswer(question.id, option.id)}
                            disabled={state?.solved || state?.pending}
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
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-lg border text-[11px] font-bold ${
                                showCorrect
                                  ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-300"
                                  : showWrong
                                    ? "border-rose-300/30 bg-rose-300/10 text-rose-300"
                                    : "border-white/[0.09] bg-white/[0.025] text-slate-500"
                              }`}
                            >
                              {showCorrect ? (
                                <Check className="size-4" />
                              ) : showWrong ? (
                                <X className="size-4" />
                              ) : (
                                String.fromCharCode(65 + index)
                              )}
                            </span>
                            <span className="flex-1">{option.label}</span>
                            {state?.pending && selected ? (
                              <Loader2 className="size-4 animate-spin opacity-70" aria-hidden="true" />
                            ) : selected ? (
                              <CheckCircle2 className="size-4 opacity-60" aria-hidden="true" />
                            ) : (
                              <Circle className="size-3.5 opacity-30" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {state?.error && (
                      <p
                        className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-3 text-xs leading-5 text-amber-100"
                        role="alert"
                      >
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        {state.error}
                      </p>
                    )}

                    {state?.solved && (
                      <div
                        className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 text-sm leading-6 text-emerald-100"
                        role="status"
                      >
                        <p className="font-semibold">Düzgün cavab!</p>
                        {state.explanation && (
                          <p className="mt-1 text-xs leading-5 opacity-75">{state.explanation}</p>
                        )}
                      </div>
                    )}

                    {!state?.solved && state?.wrongOptionId && (
                      <div
                        className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.045] p-4 text-sm leading-6 text-rose-100"
                        role="status"
                      >
                        <p className="font-semibold">Bir daha düşün.</p>
                        <p className="mt-1 text-xs leading-5 opacity-75">
                          Mətndəki əsas anlayışa yenidən bax və başqa variantı sına.
                        </p>
                        <button
                          type="button"
                          onClick={() => resetQuestion(question.id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
                        >
                          <RotateCcw className="size-3.5" aria-hidden="true" />
                          Yenidən cəhd et
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

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

                {currentCompleted && !isLastTask && (
                  <button
                    type="button"
                    onClick={() => goToTask(currentTaskIndex + 1)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-emerald-950 transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Növbəti task
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                )}

                {currentCompleted && isLastTask && completedTaskIds.length === room.tasks.length && (
                  <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.08] px-5 text-sm font-semibold text-violet-200">
                    <Sparkles className="size-4" aria-hidden="true" />
                    Room tamamlandı · {earnedPoints} XP
                  </div>
                )}

                {!currentCompleted && (
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
