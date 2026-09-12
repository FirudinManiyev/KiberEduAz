"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ListChecks,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import type {
  AuthorTask,
  LessonSection,
  QuestionType,
  RoomDetailForAuthor,
  UpsertTaskBody,
} from "@/lib/api/types";

/// A task being edited. `id` is null until it has been saved once, which is
/// also what decides POST versus PATCH.
type DraftQuestion = {
  key: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
  points: number;
  acceptedAnswers: string;
  options: { key: string; label: string; isCorrect: boolean }[];
};

type DraftTask = {
  key: string;
  id: string | null;
  title: string;
  durationLabel: string;
  points: number;
  sections: { key: string; heading: string; body: string; bullets: string }[];
  questions: DraftQuestion[];
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "SINGLE_CHOICE", label: "Tək seçimli" },
  { value: "TRUE_FALSE", label: "Doğru / Yanlış" },
  { value: "SHORT_ANSWER", label: "Açıq cavab" },
];

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

function toDraftTask(task: AuthorTask): DraftTask {
  return {
    key: nextKey("task"),
    id: task.id,
    title: task.title,
    durationLabel: task.durationLabel,
    points: task.points,
    sections: task.sections.map((section) => ({
      key: nextKey("section"),
      heading: section.heading ?? "",
      body: section.body,
      bullets: (section.bullets ?? []).join("\n"),
    })),
    questions: task.questions.map((question) => ({
      key: nextKey("question"),
      type: question.type,
      prompt: question.prompt,
      explanation: question.explanation,
      points: question.points,
      acceptedAnswers: question.acceptedAnswers.join("\n"),
      options: question.options.map((option) => ({
        key: nextKey("option"),
        label: option.label,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}

function emptyTask(): DraftTask {
  return {
    key: nextKey("task"),
    id: null,
    title: "",
    durationLabel: "10 dəq",
    points: 10,
    sections: [{ key: nextKey("section"), heading: "", body: "", bullets: "" }],
    questions: [],
  };
}

function emptyQuestion(): DraftQuestion {
  return {
    key: nextKey("question"),
    type: "SINGLE_CHOICE",
    prompt: "",
    explanation: "",
    points: 10,
    acceptedAnswers: "",
    options: [
      { key: nextKey("option"), label: "", isCorrect: true },
      { key: nextKey("option"), label: "", isCorrect: false },
    ],
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/// Mirrors the server-side rules in RoomsService.createQuestion, so a teacher
/// sees the problem next to the field rather than as a 400 after saving.
function validate(task: DraftTask): string | null {
  if (task.title.trim().length < 2) return "Task başlığı ən azı 2 simvol olmalıdır.";

  for (const section of task.sections) {
    if (!section.body.trim()) return "Boş mətn bölməsi ola bilməz — ya doldur, ya sil.";
  }

  for (const [index, question] of task.questions.entries()) {
    const label = `${index + 1}-ci sual`;

    if (question.prompt.trim().length < 3) return `${label}: sual mətni çox qısadır.`;

    if (question.type === "SHORT_ANSWER") {
      if (splitLines(question.acceptedAnswers).length === 0) {
        return `${label}: açıq sual üçün ən azı bir qəbul edilən cavab lazımdır.`;
      }
      continue;
    }

    const options = question.options.filter((option) => option.label.trim());

    if (options.length < 2) return `${label}: ən azı iki variant lazımdır.`;
    if (!options.some((option) => option.isCorrect)) {
      return `${label}: ən azı bir variant düzgün işarələnməlidir.`;
    }
    if (question.type === "SINGLE_CHOICE" && options.filter((o) => o.isCorrect).length > 1) {
      return `${label}: tək seçimli sualda yalnız bir düzgün variant ola bilər.`;
    }
  }

  return null;
}

function toBody(task: DraftTask, orderIndex: number): UpsertTaskBody {
  const sections: LessonSection[] = task.sections
    .filter((section) => section.body.trim())
    .map((section) => ({
      ...(section.heading.trim() ? { heading: section.heading.trim() } : {}),
      body: section.body.trim(),
      ...(splitLines(section.bullets).length ? { bullets: splitLines(section.bullets) } : {}),
    }));

  return {
    title: task.title.trim(),
    durationLabel: task.durationLabel.trim(),
    points: task.points,
    orderIndex,
    sections,
    questions: task.questions.map((question, index) => ({
      type: question.type,
      prompt: question.prompt.trim(),
      explanation: question.explanation.trim(),
      points: question.points,
      orderIndex: index + 1,
      ...(question.type === "SHORT_ANSWER"
        ? { acceptedAnswers: splitLines(question.acceptedAnswers) }
        : {
            options: question.options
              .filter((option) => option.label.trim())
              .map((option) => ({ label: option.label.trim(), isCorrect: option.isCorrect })),
          }),
    })),
  };
}

export function RoomContentEditor({ room }: { room: RoomDetailForAuthor }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<DraftTask[]>(() => room.tasks.map(toDraftTask));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function update(key: string, change: (task: DraftTask) => DraftTask) {
    setTasks((current) => current.map((task) => (task.key === key ? change(task) : task)));
  }

  function addTask() {
    const task = emptyTask();

    setTasks((current) => [...current, task]);
    setOpenKey(task.key);
  }

  async function save(task: DraftTask) {
    const problem = validate(task);

    if (problem) {
      toast.error(problem);
      return;
    }

    setSavingKey(task.key);

    const orderIndex = tasks.findIndex((entry) => entry.key === task.key) + 1;
    const body = JSON.stringify(toBody(task, orderIndex));

    try {
      const saved = await apiRequest<{ id: string }>(
        task.id ? `/rooms/${room.id}/tasks/${task.id}` : `/rooms/${room.id}/tasks`,
        { method: task.id ? "PATCH" : "POST", body },
      );

      // Capture the new id so the next save updates rather than duplicates.
      update(task.key, (current) => ({ ...current, id: current.id ?? saved.id }));
      toast.success("Task saxlanıldı");
      router.refresh();
    } catch (cause) {
      toast.error(toUserErrorMessage(cause, "Task saxlanıla bilmədi"));
    } finally {
      setSavingKey(null);
    }
  }

  async function remove(task: DraftTask) {
    // An unsaved task exists only in this form, so it just disappears.
    if (!task.id) {
      setTasks((current) => current.filter((entry) => entry.key !== task.key));
      return;
    }

    if (!window.confirm(`"${task.title}" task-ı silinsin? Bu geri qaytarıla bilməz.`)) return;

    setSavingKey(task.key);

    try {
      await apiRequest(`/rooms/${room.id}/tasks/${task.id}`, { method: "DELETE" });
      setTasks((current) => current.filter((entry) => entry.key !== task.key));
      toast.success("Task silindi");
      router.refresh();
    } catch (cause) {
      toast.error(toUserErrorMessage(cause, "Task silinə bilmədi"));
    } finally {
      setSavingKey(null);
    }
  }

  const questionCount = tasks.reduce((sum, task) => sum + task.questions.length, 0);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10">
      <Link
        href="/teacher"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-emerald-300"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
        Müəllim panelinə qayıt
      </Link>

      <header className="mt-5 rounded-2xl border border-red-300/10 bg-[#1a1d1f] p-5 sm:p-7">
        <p className="section-kicker">
          {room.path.title} · {room.module.title}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
          {room.title}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5" /> {tasks.length} task
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> {questionCount} sual
          </span>
          <span
            className={
              room.status === "PUBLISHED"
                ? "inline-flex items-center gap-1.5 text-emerald-400"
                : "inline-flex items-center gap-1.5 text-amber-400"
            }
          >
            <CheckCircle2 className="size-3.5" />
            {room.status === "PUBLISHED" ? "Dərc olunub" : "Qaralama"}
          </span>
        </p>
        {room.status !== "PUBLISHED" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3 text-[11px] leading-5 text-amber-100/80">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            Bu Room qaralamadır — məzmunu hazırladıqdan sonra admin təsdiqindən keçib dərc olunacaq.
          </p>
        )}
      </header>

      <div className="mt-6 space-y-3">
        {tasks.map((task, index) => {
          const open = openKey === task.key;
          const busy = savingKey === task.key;

          return (
            <section
              key={task.key}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1a1d1f]"
            >
              <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] font-mono text-xs text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : task.key)}
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={open}
                >
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {task.title || "Adsız task"}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">
                    {task.sections.length} bölmə · {task.questions.length} sual · {task.points} XP
                    {task.id ? "" : " · saxlanılmayıb"}
                  </span>
                </button>
                <ChevronDown
                  className={`size-4 shrink-0 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>

              {open && (
                <div className="border-t border-white/[0.06] p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
                    <Field label="Başlıq">
                      <input
                        className="editor-input"
                        value={task.title}
                        onChange={(e) => update(task.key, (t) => ({ ...t, title: e.target.value }))}
                        maxLength={200}
                      />
                    </Field>
                    <Field label="Müddət">
                      <input
                        className="editor-input"
                        value={task.durationLabel}
                        onChange={(e) =>
                          update(task.key, (t) => ({ ...t, durationLabel: e.target.value }))
                        }
                        maxLength={60}
                      />
                    </Field>
                    <Field label="XP">
                      <input
                        className="editor-input"
                        type="number"
                        min={0}
                        max={10000}
                        value={task.points}
                        onChange={(e) =>
                          update(task.key, (t) => ({ ...t, points: Number(e.target.value) || 0 }))
                        }
                      />
                    </Field>
                  </div>

                  <Subheading
                    title="Dərs mətni"
                    hint="Şagirdin oxuyacağı hissə. Hər bölmə ayrıca başlıq və siyahı ala bilər."
                    onAdd={() =>
                      update(task.key, (t) => ({
                        ...t,
                        sections: [
                          ...t.sections,
                          { key: nextKey("section"), heading: "", body: "", bullets: "" },
                        ],
                      }))
                    }
                  />

                  <div className="space-y-3">
                    {task.sections.map((section, sectionIndex) => (
                      <div
                        key={section.key}
                        className="rounded-xl border border-white/[0.06] bg-black/20 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Bölmə {sectionIndex + 1}
                          </span>
                          <RemoveButton
                            label="Bölməni sil"
                            onClick={() =>
                              update(task.key, (t) => ({
                                ...t,
                                sections: t.sections.filter((s) => s.key !== section.key),
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <input
                            className="editor-input"
                            placeholder="Başlıq (istəyə bağlı)"
                            value={section.heading}
                            maxLength={200}
                            onChange={(e) =>
                              update(task.key, (t) => ({
                                ...t,
                                sections: t.sections.map((s) =>
                                  s.key === section.key ? { ...s, heading: e.target.value } : s,
                                ),
                              }))
                            }
                          />
                          <textarea
                            className="editor-input min-h-[110px]"
                            placeholder="Mətn"
                            value={section.body}
                            maxLength={5000}
                            onChange={(e) =>
                              update(task.key, (t) => ({
                                ...t,
                                sections: t.sections.map((s) =>
                                  s.key === section.key ? { ...s, body: e.target.value } : s,
                                ),
                              }))
                            }
                          />
                          <textarea
                            className="editor-input min-h-[70px]"
                            placeholder="Siyahı — hər sətir bir bənd (istəyə bağlı)"
                            value={section.bullets}
                            onChange={(e) =>
                              update(task.key, (t) => ({
                                ...t,
                                sections: t.sections.map((s) =>
                                  s.key === section.key ? { ...s, bullets: e.target.value } : s,
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Subheading
                    title="Suallar"
                    hint="Sualsız task oxunduqdan sonra şagird tərəfindən təsdiqlənir."
                    onAdd={() =>
                      update(task.key, (t) => ({ ...t, questions: [...t.questions, emptyQuestion()] }))
                    }
                  />

                  <div className="space-y-3">
                    {task.questions.map((question, questionIndex) => (
                      <QuestionEditor
                        key={question.key}
                        index={questionIndex}
                        question={question}
                        onChange={(change) =>
                          update(task.key, (t) => ({
                            ...t,
                            questions: t.questions.map((q) =>
                              q.key === question.key ? change(q) : q,
                            ),
                          }))
                        }
                        onRemove={() =>
                          update(task.key, (t) => ({
                            ...t,
                            questions: t.questions.filter((q) => q.key !== question.key),
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                    <button
                      type="button"
                      onClick={() => void save(task)}
                      disabled={busy}
                      className="primary-action disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Task-ı saxla
                      <span className="button-sheen" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(task)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 px-4 py-2.5 text-xs font-semibold text-rose-200 transition-colors hover:border-rose-300/40 hover:bg-rose-300/[0.07] disabled:opacity-40"
                    >
                      <Trash2 className="size-4" />
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {tasks.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] p-8 text-center text-sm text-slate-500">
            Bu Room-da hələ task yoxdur. Şagirdlərin görməsi üçün ən azı bir task əlavə et.
          </p>
        )}

        <button
          type="button"
          onClick={addTask}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] py-4 text-xs font-semibold text-slate-400 transition-colors hover:border-emerald-300/30 hover:text-emerald-300"
        >
          <Plus className="size-4" />
          Yeni task əlavə et
        </button>
      </div>
    </div>
  );
}

function QuestionEditor({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number;
  question: DraftQuestion;
  onChange: (change: (q: DraftQuestion) => DraftQuestion) => void;
  onRemove: () => void;
}) {
  const choice = question.type !== "SHORT_ANSWER";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Sual {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <select
            className="editor-input h-8 w-auto py-0 text-[11px]"
            value={question.type}
            onChange={(e) => {
              const type = e.target.value as QuestionType;

              onChange((q) => ({
                ...q,
                type,
                // True/false writes its own pair, so the old labels would be
                // confusing leftovers.
                options:
                  type === "TRUE_FALSE"
                    ? [
                        { key: nextKey("option"), label: "Doğru", isCorrect: true },
                        { key: nextKey("option"), label: "Yanlış", isCorrect: false },
                      ]
                    : q.options,
              }));
            }}
          >
            {QUESTION_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <RemoveButton label="Sualı sil" onClick={onRemove} />
        </div>
      </div>

      <div className="space-y-2">
        <textarea
          className="editor-input min-h-[70px]"
          placeholder="Sual mətni"
          value={question.prompt}
          maxLength={1000}
          onChange={(e) => onChange((q) => ({ ...q, prompt: e.target.value }))}
        />

        {choice ? (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option.key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange((q) => ({
                      ...q,
                      options: q.options.map((o) =>
                        o.key === option.key
                          ? { ...o, isCorrect: !o.isCorrect }
                          : // Single choice allows exactly one, so selecting
                            // one clears the rest.
                            q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE"
                            ? { ...o, isCorrect: false }
                            : o,
                      ),
                    }))
                  }
                  aria-pressed={option.isCorrect}
                  aria-label={option.isCorrect ? "Düzgün variant" : "Düzgün kimi işarələ"}
                  className={`grid size-7 shrink-0 place-items-center rounded-lg border transition-colors ${
                    option.isCorrect
                      ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-300"
                      : "border-white/[0.08] text-slate-700 hover:border-emerald-300/25"
                  }`}
                >
                  <CheckCircle2 className="size-4" />
                </button>
                <input
                  className="editor-input"
                  placeholder="Variant mətni"
                  value={option.label}
                  maxLength={500}
                  onChange={(e) =>
                    onChange((q) => ({
                      ...q,
                      options: q.options.map((o) =>
                        o.key === option.key ? { ...o, label: e.target.value } : o,
                      ),
                    }))
                  }
                />
                <RemoveButton
                  label="Variantı sil"
                  onClick={() =>
                    onChange((q) => ({
                      ...q,
                      options: q.options.filter((o) => o.key !== option.key),
                    }))
                  }
                />
              </div>
            ))}
            {question.options.length < 10 && (
              <button
                type="button"
                onClick={() =>
                  onChange((q) => ({
                    ...q,
                    options: [
                      ...q.options,
                      { key: nextKey("option"), label: "", isCorrect: false },
                    ],
                  }))
                }
                className="text-[11px] font-semibold text-slate-500 transition-colors hover:text-emerald-300"
              >
                + Variant əlavə et
              </button>
            )}
          </div>
        ) : (
          <textarea
            className="editor-input min-h-[70px]"
            placeholder="Qəbul edilən cavablar — hər sətir bir variant. Böyük/kiçik hərf fərqi yoxdur."
            value={question.acceptedAnswers}
            onChange={(e) => onChange((q) => ({ ...q, acceptedAnswers: e.target.value }))}
          />
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
          <textarea
            className="editor-input min-h-[60px]"
            placeholder="İzah — şagird düzgün cavab verdikdən sonra göstərilir"
            value={question.explanation}
            maxLength={2000}
            onChange={(e) => onChange((q) => ({ ...q, explanation: e.target.value }))}
          />
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              XP
            </span>
            <input
              className="editor-input mt-1"
              type="number"
              min={0}
              max={10000}
              value={question.points}
              onChange={(e) => onChange((q) => ({ ...q, points: Number(e.target.value) || 0 }))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Subheading({
  title,
  hint,
  onAdd,
}: {
  title: string;
  hint: string;
  onAdd: () => void;
}) {
  return (
    <div className="mb-3 mt-6 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="mt-0.5 text-[11px] text-slate-600">{hint}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:border-emerald-300/30 hover:text-emerald-300"
      >
        <Plus className="size-3.5" />
        Əlavə et
      </button>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-700 transition-colors hover:bg-rose-300/10 hover:text-rose-300"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
