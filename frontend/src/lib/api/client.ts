"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { API_TIMEOUT_MS, isRetryable, retryDelay, sleep } from "./retry";

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

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const method = (init.method ?? "GET").toUpperCase();

  for (let attempt = 0; ; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          ...init.headers,
        },
      });
    } catch (cause) {
      // The free-plan instance may still be waking; give a read another go
      // before telling the visitor the network is broken.
      const delay = isRetryable(method) ? retryDelay(attempt) : null;

      if (delay !== null) {
        await sleep(delay);
        continue;
      }

      throw cause;
    }

    if (!response.ok) {
      const delay = isRetryable(method, response.status) ? retryDelay(attempt) : null;

      if (delay !== null) {
        await sleep(delay);
        continue;
      }

      let message = response.statusText || "Naməlum server xətası";

      try {
        const payload = (await response.json()) as { message?: string | string[] };
        const raw = payload.message;

        if (Array.isArray(raw)) message = raw.join(", ");
        else if (raw) message = raw;
      } catch {
        // keep the status text
      }

      throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}
