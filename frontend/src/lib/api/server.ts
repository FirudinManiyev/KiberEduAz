import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 127.0.0.1 rather than localhost: Node resolves localhost to ::1 first, and the
// API binds 0.0.0.0 (IPv4 only), so server-side fetches would get ECONNREFUSED.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/// Server-side fetch against the NestJS API, carrying the caller's Supabase
/// access token. Every response is uncached because all of it is per-user.
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/// Returns null instead of throwing, for pages that should still render when a
/// single panel fails or the learner is signed out.
export async function apiFetchOrNull<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    return await apiFetch<T>(path, init);
  } catch {
    return null;
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    const message = payload.message;

    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  } catch {
    // fall through to the status text
  }

  return response.statusText || "Naməlum server xətası";
}
