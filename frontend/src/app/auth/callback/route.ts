import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeAuthCallbackReason } from "@/lib/auth/callback-error";
import { getSiteUrl, safeRelativePath } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1").replace(
  /\/$/,
  "",
);

/// Teacher sign-up carries its application in user_metadata because the account does
/// not exist yet when the form is submitted. Confirming the mail is the first moment
/// a session exists, so file the application here; a failure leaves the flag in place
/// and the next sign-in retries it from auth-form.tsx.
async function finishPendingTeacher(accessToken: string, institutionName: string) {
  const response = await fetch(`${API_URL}/profiles/me/request-teacher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ institutionName }),
  });

  return response.ok;
}

/// Landing route for every Supabase auth mail. Depending on the template the link
/// arrives with a PKCE `code` (what @supabase/ssr's browser client requests) or with
/// `token_hash` + `type`, so both are accepted.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Pinned to NEXT_PUBLIC_SITE_URL rather than built from x-forwarded-host:
  // that header is attacker-controlled behind any proxy that forwards client
  // headers unfiltered, and it decides where a confirmed visitor lands.
  const origin = getSiteUrl();
  const next = safeRelativePath(searchParams.get("next"));

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Supabase reports a rejected link (expired, already used) on the query string.
  const linkError = searchParams.get("error_description") ?? searchParams.get("error");

  if (linkError) {
    return NextResponse.redirect(`${origin}/login?authError=${safeAuthCallbackReason(linkError)}`);
  }

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/login?authError=missing-code`);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?authError=${safeAuthCallbackReason(error.message)}`,
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const meta = session?.user.user_metadata as
    | { pending_teacher?: boolean; institution_name?: string }
    | undefined;

  const destination =
    session && meta?.pending_teacher
      ? await filePendingTeacher(supabase, session.access_token, meta.institution_name)
      : (next ?? "/dashboard");

  const response = NextResponse.redirect(`${origin}${destination}`);

  clearPkceVerifierCookies(request, response);

  return response;
}

async function filePendingTeacher(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  accessToken: string,
  institutionName: string | undefined,
): Promise<string> {
  try {
    const filed = await finishPendingTeacher(
      accessToken,
      institutionName || "Müəssisə göstərilməyib",
    );

    if (filed) {
      await supabase.auth.updateUser({ data: { pending_teacher: false } });
    }
  } catch {
    // API unreachable: keep the flag so the next sign-in files the application.
  }

  return "/pending";
}

/// The PKCE verifier is single-use and is spent by exchangeCodeForSession, but
/// Supabase writes it with a ~1 year Expires, so on a shared or kiosk browser
/// it can linger long after the flow it belonged to. Drop it explicitly.
function clearPkceVerifierCookies(request: NextRequest, response: NextResponse): void {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("code-verifier")) {
      response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }
}
