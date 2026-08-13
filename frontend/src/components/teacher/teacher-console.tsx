"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  BookPlus,
  Check,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type {
  ClassDetail,
  ClassSummary,
  MyProfile,
  PathTreeNode,
  RoomSummary,
} from "@/lib/api/types";

type Props = {
  profile: MyProfile;
  initialPaths: PathTreeNode[];
  initialRooms: RoomSummary[];
  initialClasses: ClassSummary[];
};

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("az")
    .replace(/[əıöüğşçİ]/g, (char) =>
      ({ ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c", İ: "i" })[char] ?? char,
    )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function TeacherConsole({ profile, initialPaths, initialRooms, initialClasses }: Props) {
  const [paths, setPaths] = useState(initialPaths);
  const [rooms, setRooms] = useState(initialRooms);
  const [classes, setClasses] = useState(initialClasses);
  const [activeClassId, setActiveClassId] = useState(initialClasses[0]?.id ?? "");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const modules = useMemo(
    () =>
      paths.flatMap((path) =>
        path.modules.map((module) => ({
          ...module,
          pathTitle: path.title,
          pathId: path.id,
        })),
      ),
    [paths],
  );

  async function refreshPaths() {
    const next = await apiRequest<PathTreeNode[]>("/paths");
    setPaths(next);
  }

  async function refreshRooms() {
    const next = await apiRequest<RoomSummary[]>("/rooms");
    setRooms(next);
  }

  async function refreshClasses() {
    const next = await apiRequest<ClassSummary[]>("/classes");
    setClasses(next);
  }

  async function loadClass(id: string) {
    if (!id) return;
    setActiveClassId(id);
    const detail = await apiRequest<ClassDetail>(`/classes/${id}`);
    setClassDetail(detail);
  }

  async function createModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const pathId = String(form.get("pathId"));
    const title = String(form.get("title")).trim();

    try {
      await apiRequest("/modules", {
        method: "POST",
        body: JSON.stringify({
          pathId,
          title,
          slug: slugify(title) || `modul-${Date.now()}`,
          description: String(form.get("description") ?? ""),
          status: "DRAFT",
        }),
      });
      event.currentTarget.reset();
      await refreshPaths();
      setMessage("Modul yaradıldı.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Modul yaradıla bilmədi");
    } finally {
      setBusy(false);
    }
  }

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    const moduleId = String(form.get("moduleId"));

    try {
      await apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify({
          moduleId,
          title,
          slug: slugify(title) || `room-${Date.now()}`,
          shortTitle: title,
          description: String(form.get("description") ?? ""),
          category: String(form.get("category") || "Ümumi"),
          type: String(form.get("type") || "WALKTHROUGH"),
          difficulty: String(form.get("difficulty") || "BEGINNER"),
          durationLabel: String(form.get("durationLabel") || "30 dəq"),
          points: Number(form.get("points") || 100),
          accent: "GREEN",
          objectives: [],
        }),
      });
      event.currentTarget.reset();
      await refreshRooms();
      setMessage("Room yaradıldı (DRAFT). Admin təsdiqindən sonra şagirdlərə açılacaq.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Room yaradıla bilmədi");
    } finally {
      setBusy(false);
    }
  }

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);

    try {
      const created = await apiRequest<ClassSummary>("/classes", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name")).trim(),
          academicYear: String(form.get("academicYear") || "") || undefined,
        }),
      });
      event.currentTarget.reset();
      await refreshClasses();
      await loadClass(created.id);
      setMessage("Sinif yaradıldı.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sinif yaradıla bilmədi");
    } finally {
      setBusy(false);
    }
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeClassId) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);

    try {
      const detail = await apiRequest<ClassDetail>(`/classes/${activeClassId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: String(form.get("email")).trim() }),
      });
      event.currentTarget.reset();
      setClassDetail(detail);
      await refreshClasses();
      setMessage("Şagird sinfə əlavə olundu.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Şagird əlavə edilə bilmədi");
    } finally {
      setBusy(false);
    }
  }

  async function removeStudent(profileId: string) {
    if (!activeClassId) return;
    setBusy(true);
    setError(null);

    try {
      const detail = await apiRequest<ClassDetail>(
        `/classes/${activeClassId}/members/${profileId}`,
        { method: "DELETE" },
      );
      setClassDetail(detail);
      await refreshClasses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Silinmədi");
    } finally {
      setBusy(false);
    }
  }

  const draftRooms = rooms.filter((room) => room.status === "DRAFT");
  const publishedRooms = rooms.filter((room) => room.status === "PUBLISHED");

  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-10 sm:px-6 lg:px-10">
      <header>
        <p className="section-kicker">Müəllim paneli</p>
        <h1 className="section-title">Salam, {profile.fullName ?? profile.email}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Modul və Room yarat, sinfə mövcud şagirdləri email ilə qoş. Room-lar admin təsdiqindən sonra şagirdlərə görünür.
        </p>
      </header>

      {(message || error) && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-300/20 bg-rose-300/[0.07] text-rose-100"
              : "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100"
          }`}
          role="status"
        >
          {error ?? message}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Siniflər" value={classes.length} />
        <Stat label="Gözləyən Room" value={draftRooms.length} />
        <Stat label="Açıq Room" value={publishedRooms.length} />
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Modul yarat" icon={<BookPlus className="size-4" />}>
          <form onSubmit={createModule} className="space-y-3">
            <label className="block text-xs text-slate-400">
              Path
              <select name="pathId" required className="panel-input mt-1.5">
                {paths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              Modul adı
              <input name="title" required className="panel-input mt-1.5" placeholder="Linux əsasları" />
            </label>
            <label className="block text-xs text-slate-400">
              Qısa təsvir
              <input name="description" className="panel-input mt-1.5" placeholder="Fayl sistemi və icazələr" />
            </label>
            <button type="submit" disabled={busy || paths.length === 0} className="primary-action">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Modul əlavə et
            </button>
          </form>
        </Panel>

        <Panel title="Room yarat" icon={<Plus className="size-4" />}>
          <form onSubmit={createRoom} className="space-y-3">
            <label className="block text-xs text-slate-400">
              Modul
              <select name="moduleId" required className="panel-input mt-1.5">
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.pathTitle} · {module.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              Room adı
              <input name="title" required className="panel-input mt-1.5" placeholder="Pentestinqə giriş" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">
                Tip
                <select name="type" className="panel-input mt-1.5">
                  <option value="WALKTHROUGH">Walkthrough</option>
                  <option value="CHALLENGE">Challenge</option>
                  <option value="ANALYSIS">Analysis</option>
                </select>
              </label>
              <label className="block text-xs text-slate-400">
                Çətinlik
                <select name="difficulty" className="panel-input mt-1.5">
                  <option value="BEGINNER">Başlanğıc</option>
                  <option value="INTERMEDIATE">Orta</option>
                  <option value="ADVANCED">Çətin</option>
                </select>
              </label>
            </div>
            <label className="block text-xs text-slate-400">
              Təsvir
              <input name="description" className="panel-input mt-1.5" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">
                Müddət
                <input name="durationLabel" className="panel-input mt-1.5" placeholder="45 dəq" />
              </label>
              <label className="block text-xs text-slate-400">
                Xal
                <input name="points" type="number" min={0} defaultValue={100} className="panel-input mt-1.5" />
              </label>
            </div>
            <button type="submit" disabled={busy || modules.length === 0} className="primary-action">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Room yarat (admin təsdiqi lazımdır)
            </button>
          </form>
        </Panel>
      </div>

      <Panel title="Room-ların" icon={<Check className="size-4" />}>
        <div className="divide-y divide-white/[0.06]">
          {rooms.length === 0 && <p className="py-4 text-sm text-slate-500">Hələ Room yoxdur.</p>}
          {rooms.map((room) => (
            <div key={room.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{room.title}</p>
                <p className="text-[11px] text-slate-600">
                  {room.path} · {room.module} · {room.taskCount} task
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={room.status} />
                <Link href={`/rooms/${room.slug}`} className="text-xs font-semibold text-emerald-300 hover:underline">
                  Bax
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Panel title="Siniflər" icon={<Users className="size-4" />}>
          <form onSubmit={createClass} className="mb-4 space-y-3 border-b border-white/[0.06] pb-4">
            <input name="name" required placeholder="11A · Kiber klub" className="panel-input" />
            <input name="academicYear" placeholder="2025/2026" className="panel-input" />
            <button type="submit" disabled={busy} className="secondary-action w-full justify-center">
              <Plus className="size-4" /> Sinif yarat
            </button>
          </form>
          <div className="space-y-1">
            {classes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void loadClass(item.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                  activeClassId === item.id
                    ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-100"
                    : "border-transparent text-slate-400 hover:bg-white/[0.03]"
                }`}
              >
                <span>{item.name}</span>
                <span className="font-mono text-[10px]">{item._count.memberships}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Şagirdləri qoş" icon={<Users className="size-4" />}>
          {!activeClassId ? (
            <p className="text-sm text-slate-500">Əvvəlcə sinif yarat və ya seç.</p>
          ) : (
            <>
              <form onSubmit={addStudent} className="mb-5 flex flex-col gap-3 sm:flex-row">
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="sagird@mekteb.edu.az"
                  className="panel-input flex-1"
                />
                <button type="submit" disabled={busy} className="primary-action shrink-0">
                  Əlavə et
                </button>
              </form>
              <div className="divide-y divide-white/[0.06]">
                {(classDetail?.students ?? []).length === 0 && (
                  <p className="py-3 text-sm text-slate-500">
                    Sinif boşdur. Artıq qeydiyyatdan keçmiş şagirdin emailini yaz.
                  </p>
                )}
                {(classDetail?.students ?? []).map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {student.fullName ?? student.email}
                      </p>
                      <p className="text-[11px] text-slate-600">{student.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeStudent(student.id)}
                      className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-500 hover:border-rose-300/30 hover:text-rose-300"
                      aria-label="Şagirdi sil"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-red-300/10 bg-[#1a1d20] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
        <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-emerald-300">
          {icon}
        </span>
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-red-300/10 bg-[#1a1d20] p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    PUBLISHED: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
    ARCHIVED: "border-white/10 bg-white/[0.04] text-slate-400",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? map.ARCHIVED}`}>
      {status === "DRAFT" ? "Gözləmədə" : status === "PUBLISHED" ? "Açıq" : status}
    </span>
  );
}
