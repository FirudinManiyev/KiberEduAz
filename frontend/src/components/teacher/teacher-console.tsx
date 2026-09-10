"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  BookPlus,
  Check,
  GraduationCap,
  Loader2,
  Plus,
  Radar,
  Trash2,
  Users,
} from "lucide-react";
import { CyberHeroShell } from "@/components/hero/cyber-hero-shell";
import { ProgressiveDisclosure } from "@/components/ui/progressive-disclosure";
import { apiRequest } from "@/lib/api/client";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import type {
  ClassDetail,
  ClassSummary,
  MyProfile,
  PathTreeNode,
  RoomSummary,
} from "@/lib/api/types";
import { getProgressiveListState } from "@/lib/ui/progressive-list";

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
  const [loadingClassId, setLoadingClassId] = useState<string | null>(null);
  const [roomsExpanded, setRoomsExpanded] = useState(false);
  const [classesExpanded, setClassesExpanded] = useState(false);
  const [studentsExpanded, setStudentsExpanded] = useState(false);

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

  async function loadClass(id: string): Promise<boolean> {
    if (!id) return false;
    setActiveClassId(id);
    setStudentsExpanded(false);
    setLoadingClassId(id);
    setError(null);

    try {
      const detail = await apiRequest<ClassDetail>(`/classes/${id}`);
      setClassDetail(detail);
      return true;
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Sinif məlumatları yüklənə bilmədi");
      setClassDetail(null);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoadingClassId(null);
    }
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
      toast.success("Modul yaradıldı");
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Modul yaradıla bilmədi");
      setError(message);
      toast.error(message);
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
      toast.success("Room yaradıldı", {
        description: "Admin təsdiqindən sonra öyrənənlərə açılacaq.",
      });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Room yaradıla bilmədi");
      setError(message);
      toast.error(message);
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
      const classLoaded = await loadClass(created.id);
      setMessage(
        classLoaded
          ? "Sinif yaradıldı."
          : "Sinif yaradıldı, amma məlumatları indi göstərmək mümkün olmadı.",
      );
      toast.success("Sinif yaradıldı", {
        description: classLoaded ? undefined : "Məlumatları indi göstərmək mümkün olmadı.",
      });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Sinif yaradıla bilmədi");
      setError(message);
      toast.error(message);
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
      toast.success("Şagird sinfə əlavə olundu");
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Şagird sinfə əlavə edilə bilmədi");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function removeStudent(profileId: string) {
    if (!activeClassId) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const detail = await apiRequest<ClassDetail>(
        `/classes/${activeClassId}/members/${profileId}`,
        { method: "DELETE" },
      );
      setClassDetail(detail);
      await refreshClasses();
      setMessage("Şagird sinifdən silindi.");
      toast.success("Şagird sinifdən silindi");
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Şagird sinifdən silinə bilmədi");
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const draftRooms = rooms.filter((room) => room.status === "DRAFT");
  const publishedRooms = rooms.filter((room) => room.status === "PUBLISHED");
  const roomList = getProgressiveListState(rooms, roomsExpanded);
  const classList = getProgressiveListState(classes, classesExpanded);
  const students = classDetail?.students ?? [];
  const studentList = getProgressiveListState(students, studentsExpanded);

  return (
    <div className="space-y-10 pb-10">
      <CyberHeroShell ariaLabelledby="teacher-hero-heading">
        <div className="mx-auto grid min-h-[inherit] max-w-[1440px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:py-20">
          <header className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 backdrop-blur-md">
              <Radar className="size-3.5" aria-hidden="true" /> Müəllim idarəetmə mərkəzi
            </p>
            <h1
              id="teacher-hero-heading"
              className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.45)] sm:text-5xl lg:text-[60px]"
            >
              Salam,
              <br />
              <span className="text-gradient">{profile.fullName ?? profile.email}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Modulları, Room-ları və sinifləri vahid mərkəzdən idarə et. Yeni təlim hazırladıqda admin təsdiqindən sonra şagirdlərin öyrənmə axınına qoşulur.
            </p>
          </header>

          <div className="cyber-hero-panel p-5 sm:p-6">
            <div className="relative flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                  <Activity className="size-3.5" aria-hidden="true" /> Tədris göstəriciləri
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Sinif əməliyyatları</h2>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl border border-red-300/20 bg-red-300/[0.08] text-red-200">
                <GraduationCap className="size-5" aria-hidden="true" />
              </span>
            </div>
            <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Siniflər" value={classes.length} />
              <Stat label="Gözləyən Room" value={draftRooms.length} />
              <Stat label="Açıq Room" value={publishedRooms.length} />
            </div>
            <p className="relative mt-5 flex items-center gap-2 border-t border-white/[0.08] pt-4 text-[11px] text-slate-500">
              <i className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              Məlumatlar hesabınızla sinxronlaşdırılır
            </p>
          </div>
        </div>
      </CyberHeroShell>

      <div className="mx-auto max-w-[1440px] space-y-10 px-4 sm:px-6 lg:px-10">

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
          {roomList.visibleItems.map((room) => (
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
        {roomList.canToggle && (
          <ProgressiveDisclosure
            expanded={roomsExpanded}
            hiddenCount={roomList.hiddenCount}
            onToggle={() => setRoomsExpanded((current) => !current)}
          />
        )}
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
            {classList.visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void loadClass(item.id)}
                disabled={loadingClassId !== null}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                  activeClassId === item.id
                    ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-100"
                    : "border-transparent text-slate-400 hover:bg-white/[0.03]"
                }`}
              >
                <span>{item.name}</span>
                <span className="font-mono text-[10px]">
                  {loadingClassId === item.id ? (
                    <Loader2 className="size-3.5 animate-spin" aria-label="Sinif yüklənir" />
                  ) : (
                    item._count.memberships
                  )}
                </span>
              </button>
            ))}
          </div>
          {classList.canToggle && (
            <ProgressiveDisclosure
              expanded={classesExpanded}
              hiddenCount={classList.hiddenCount}
              onToggle={() => setClassesExpanded((current) => !current)}
              className="w-full"
            />
          )}
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
                {students.length === 0 && (
                  <p className="py-3 text-sm text-slate-500">
                    Sinif boşdur. Artıq qeydiyyatdan keçmiş şagirdin emailini yaz.
                  </p>
                )}
                {studentList.visibleItems.map((student) => (
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
              {studentList.canToggle && (
                <ProgressiveDisclosure
                  expanded={studentsExpanded}
                  hiddenCount={studentList.hiddenCount}
                  onToggle={() => setStudentsExpanded((current) => !current)}
                />
              )}
            </>
          )}
        </Panel>
      </div>
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
    <article className="teacher-hero-stat">
      <p className="text-[11px] leading-4 text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{String(value).padStart(2, "0")}</p>
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
