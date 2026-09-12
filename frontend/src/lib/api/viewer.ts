import "server-only";
import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "./server";
import type { MyProfile } from "./types";

/// The signed-in visitor, for pages that require one.
///
/// The distinction this makes is the whole point. A page that cannot tell
/// "you are not signed in" from "the API did not answer" sends a perfectly
/// valid session to /login - where proxy.ts looks at the Supabase cookie, sees
/// a good session, and sends it straight back to the page. That loop is what
/// made the dashboard unreachable whenever the Render free instance was cold,
/// and from the outside it looks exactly like a broken login.
///
/// So: only a real 401/403 goes to /login. Anything else - a timeout, a 502
/// while the instance wakes, a genuine bug - is re-thrown for error.tsx, which
/// says what happened and offers a retry.
export async function requireProfile(next: string): Promise<MyProfile> {
  try {
    return await apiFetch<MyProfile>("/profiles/me");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }

    throw error;
  }
}
