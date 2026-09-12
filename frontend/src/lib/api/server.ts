import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { API_TIMEOUT_MS, isRetryable, retryDelay, sleep } from "./retry";

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

/// Raised when the API could not be reached at all - no status, no body.
/// Distinct from ApiError so callers can tell "the backend is down" from
/// "the backend said no".
export class ApiUnreachableError extends Error {
  constructor(cause?: unknown) {
    super("API cavab vermədi");
    this.name = "ApiUnreachableError";
    this.cause = cause;
  }
}

/// Server-side fetch against the NestJS API, carrying the caller's Supabase
/// access token. Every response is uncached because all of it is per-user.
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const method = (init.method ?? "GET").toUpperCase();

  for (let attempt = 0; ; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...init,
        cache: "no-store",
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          ...init.headers,
        },
      });
    } catch (cause) {
      const delay = isRetryable(method) ? retryDelay(attempt) : null;

      if (delay !== null) {
        await sleep(delay);
        continue;
      }

      throw new ApiUnreachableError(cause);
    }

    if (!response.ok) {
      const delay = isRetryable(method, response.status) ? retryDelay(attempt) : null;

      if (delay !== null) {
        await sleep(delay);
        continue;
      }

      throw new ApiError(response.status, await readError(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

/// For panels that should degrade quietly rather than take the page down - an
/// empty leaderboard is better than an error screen.
///
/// Do NOT use this to decide whether somebody is signed in: it cannot tell a
/// 401 from a backend outage, and treating the second as the first bounces a
/// valid session to /login, where the proxy sees a good cookie and sends it
/// straight back. Use requireProfile from ./viewer for that.
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
