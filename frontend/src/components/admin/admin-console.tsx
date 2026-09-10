"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  Shield,
  Users,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { toUserErrorMessage } from "@/lib/errors/user-error";
import type {
  AdminStats,
  AdminUserRow,
  ClassSummary,
  PendingRoom,
  PendingTeacher,
  UserRole,
} from "@/lib/api/types";

type Props = {
  stats: AdminStats;
  pendingTeachers: PendingTeacher[];
  pendingRooms: PendingRoom[];
  users: AdminUserRow[];
  classes: ClassSummary[];
};

export function AdminConsole({
  stats: initialStats,
  pendingTeachers: initialTeachers,
  pendingRooms: initialRooms,
  users: initialUsers,
  classes,
}: Props) {
  const [stats, setStats] = useState(initialStats);
  const [pendingTeachers, setPendingTeachers] = useState(initialTeachers);
  const [pendingRooms, setPendingRooms] = useState(initialRooms);
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshStats() {
    setStats(await apiRequest<AdminStats>("/admin/stats"));
  }

  async function approveTeacher(id: string) {
    setBusyId(id);
    setError(null);
    toast.loading("Müəllim müraciəti təsdiqlənir…", { id: `teacher-${id}` });

    try {
      await apiRequest(`/admin/teachers/${id}/approve`, { method: "POST" });
      setPendingTeachers((current) => current.filter((item) => item.id !== id));
      setUsers((current) =>
        current.map((user) =>
          user.id === id ? { ...user, accountStatus: "ACTIVE", role: "TEACHER" } : user,
        ),
      );
      await refreshStats();
      toast.success("Müəllim müraciəti təsdiqləndi", { id: `teacher-${id}` });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Müəllim təsdiqlənə bilmədi");
      setError(message);
      toast.error(message, { id: `teacher-${id}` });
    } finally {
      setBusyId(null);
    }
  }

  async function rejectTeacher(id: string) {
    setBusyId(id);
    setError(null);
    toast.loading("Müəllim müraciəti rədd edilir…", { id: `teacher-${id}` });

    try {
      await apiRequest(`/admin/teachers/${id}/reject`, { method: "POST" });
      setPendingTeachers((current) => current.filter((item) => item.id !== id));
      setUsers((current) =>
        current.map((user) =>
          user.id === id ? { ...user, accountStatus: "REJECTED" } : user,
        ),
      );
      await refreshStats();
      toast.success("Müəllim müraciəti rədd edildi", { id: `teacher-${id}` });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Müraciət rədd edilə bilmədi");
      setError(message);
      toast.error(message, { id: `teacher-${id}` });
    } finally {
      setBusyId(null);
    }
  }

  async function approveRoom(id: string) {
    setBusyId(id);
    setError(null);
    toast.loading("Room dərc edilir…", { id: `room-${id}` });

    try {
      await apiRequest(`/admin/rooms/${id}/approve`, { method: "POST" });
      setPendingRooms((current) => current.filter((item) => item.id !== id));
      await refreshStats();
      toast.success("Room şagirdlər üçün açıldı", { id: `room-${id}` });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Room təsdiqlənə bilmədi");
      setError(message);
      toast.error(message, { id: `room-${id}` });
    } finally {
      setBusyId(null);
    }
  }

  async function rejectRoom(id: string) {
    setBusyId(id);
    setError(null);
    toast.loading("Room arxivlənir…", { id: `room-${id}` });

    try {
      await apiRequest(`/admin/rooms/${id}/reject`, { method: "POST" });
      setPendingRooms((current) => current.filter((item) => item.id !== id));
      await refreshStats();
      toast.success("Room arxivləndi", { id: `room-${id}` });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "Room arxivlənə bilmədi");
      setError(message);
      toast.error(message, { id: `room-${id}` });
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(id: string, role: UserRole) {
    setBusyId(id);
    setError(null);
    toast.loading("İstifadəçi rolu yenilənir…", { id: `role-${id}` });

    try {
      await apiRequest(`/profiles/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((current) =>
        current.map((user) =>
          user.id === id
            ? {
                ...user,
                role,
                accountStatus: role === "TEACHER" || role === "STUDENT" ? "ACTIVE" : user.accountStatus,
              }
            : user,
        ),
      );
      await refreshStats();
      toast.success("İstifadəçi rolu yeniləndi", { id: `role-${id}` });
    } catch (cause) {
      const message = toUserErrorMessage(cause, "İstifadəçi rolu dəyişdirilə bilmədi");
      setError(message);
      toast.error(message, { id: `role-${id}` });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-10 sm:px-6 lg:px-10">
      <header>
        <p className="section-kicker section-kicker--red">Admin paneli</p>
        <h1 className="section-title">Platforma idarəsi</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Müəllim müraciətlərini təsdiqlə, Room-lara giriş ver, istifadəçi və sinifləri izlə.
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-rose-300/20 bg-rose-300/[0.07] px-4 py-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="İstifadəçi" value={stats.users} />
        <Stat label="Şagird" value={stats.students} />
        <Stat label="Aktiv müəllim" value={stats.teachersActive} />
        <Stat label="Gözləyən müəllim" value={stats.teachersPending} />
        <Stat label="Sinif" value={stats.classes} />
        <Stat label="Açıq Room" value={stats.roomsPublished} />
        <Stat label="Gözləyən Room" value={stats.roomsDraft} />
        <Stat label="Path" value={stats.paths} />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <Panel title="Müəllim müraciətləri" icon={<Shield className="size-4" />}>
          {pendingTeachers.length === 0 ? (
            <p className="text-sm text-slate-500">Gözləyən müraciət yoxdur.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {pendingTeachers.map((teacher) => (
                <div key={teacher.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {teacher.fullName ?? teacher.email}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {teacher.email} · {teacher.institutionName ?? "müəssisə yoxdur"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === teacher.id}
                      onClick={() => void approveTeacher(teacher.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-400 px-3 text-xs font-bold text-emerald-950"
                    >
                      {busyId === teacher.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      Təsdiq
                    </button>
                    <button
                      type="button"
                      disabled={busyId === teacher.id}
                      onClick={() => void rejectTeacher(teacher.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-300/25 px-3 text-xs font-bold text-rose-200"
                    >
                      <X className="size-3.5" /> Rədd
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Room təsdiqi" icon={<Check className="size-4" />}>
          {pendingRooms.length === 0 ? (
            <p className="text-sm text-slate-500">Gözləyən Room yoxdur.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {pendingRooms.map((room) => (
                <div key={room.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{room.title}</p>
                    <p className="text-[11px] text-slate-600">
                      {room.module.path.title} · {room.module.title} · {room._count.tasks} task
                      {room.createdBy ? ` · ${room.createdBy.fullName ?? room.createdBy.email}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === room.id}
                      onClick={() => void approveRoom(room.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-400 px-3 text-xs font-bold text-emerald-950"
                    >
                      Aç
                    </button>
                    <button
                      type="button"
                      disabled={busyId === room.id}
                      onClick={() => void rejectRoom(room.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-300/25 px-3 text-xs font-bold text-rose-200"
                    >
                      Arxivlə
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel title="Siniflər" icon={<Users className="size-4" />}>
        <div className="divide-y divide-white/[0.06]">
          {classes.length === 0 && <p className="py-3 text-sm text-slate-500">Sinif yoxdur.</p>}
          {classes.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                <p className="text-[11px] text-slate-600">
                  {item.organization.name}
                  {item.teacher ? ` · ${item.teacher.fullName ?? item.teacher.email}` : ""}
                </p>
              </div>
              <span className="font-mono text-xs text-slate-500">{item._count.memberships} şagird</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="İstifadəçilər" icon={<Users className="size-4" />}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-slate-600">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Ad</th>
                <th className="pb-3 pr-4 font-semibold">Rol</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-100">{user.fullName ?? "—"}</p>
                    <p className="text-[11px] text-slate-600">{user.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{user.role}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{user.accountStatus}</td>
                  <td className="py-3">
                    <select
                      className="panel-input h-9 max-w-40"
                      value={user.role}
                      disabled={busyId === user.id || user.role === "ADMIN"}
                      onChange={(event) => void changeRole(user.id, event.target.value as UserRole)}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
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
        <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-red-300">
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
