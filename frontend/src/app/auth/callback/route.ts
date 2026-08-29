import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeAuthCallbackReason } from "@/lib/auth/callback-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1").replace(
  /\/$/,
  "",
);

/// Vercel terminates TLS in front of the app, so request.nextUrl still carries the
/// internal host. Build the redirect from the forwarded headers instead, otherwise
/// the confirmed visitor is bounced to an origin that does not exist publicly.
function siteOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (!forwardedHost) return request.nextUrl.origin;

  return `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`;
}

function safePath(value: string | null): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

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
  const origin = siteOrigin(request);
  const next = safePath(searchParams.get("next"));

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

  if (session && meta?.pending_teacher) {
    try {
      const filed = await finishPendingTeacher(
        session.access_token,
        meta.institution_name || "Müəssisə göstərilməyib",
      );

      if (filed) {
        await supabase.auth.updateUser({ data: { pending_teacher: false } });
      }
    } catch {
      // API unreachable: keep the flag so the next sign-in files the application.
    }

    return NextResponse.redirect(`${origin}/pending`);
  }

  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
