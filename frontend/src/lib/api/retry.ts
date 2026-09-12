/// Shared retry policy for both API clients.
///
/// The API runs on Render's free plan, which parks the instance after 15
/// minutes of quiet and then takes tens of seconds to wake. The first request
/// after a nap fails or times out through no fault of the caller, so reads get
/// a bounded budget and a couple more chances instead of surfacing as a real
/// answer.

export const API_TIMEOUT_MS = 15_000;
export const RETRY_DELAYS_MS = [500, 1_500] as const;

/// Statuses a proxy returns while the thing behind it is still coming up.
/// 429 is deliberately absent: a rate limit means "you asked too often", and
/// retrying it automatically is exactly the wrong response.
const COLD_START_STATUSES = new Set([408, 502, 503, 504, 522, 524]);

/// `status` omitted means the request never produced one - a timeout, a DNS
/// failure, a refused connection.
export function isRetryable(method: string, status?: number): boolean {
  // Reads only. Replaying a POST or PATCH could submit an answer twice or
  // create a second room, which is worse than the error it would paper over.
  const verb = method.toUpperCase();

  if (verb !== "GET" && verb !== "HEAD") return false;

  return status === undefined || COLD_START_STATUSES.has(status);
}

export function retryDelay(attempt: number): number | null {
  return attempt < RETRY_DELAYS_MS.length ? RETRY_DELAYS_MS[attempt] : null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
