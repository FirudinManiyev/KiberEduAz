import type { CookieOptions } from "@supabase/ssr";

/// Cookie settings shared by every @supabase/ssr client (browser, server and
/// the proxy middleware), so the session cookie is written the same way
/// whichever one last touched it.
///
/// secure: on in production only, so plain-HTTP local development still works.
///
/// sameSite: deliberately "lax", not "strict". Confirming a sign-up means
/// clicking a link in a mail client, which is a cross-site navigation; under
/// Strict the PKCE code-verifier cookie would not be sent to /auth/callback
/// and the exchange would fail. Lax still blocks cross-site POSTs, and the API
/// authenticates with a Bearer token rather than an ambient cookie, so there
/// is no cookie-driven CSRF surface to protect.
///
/// httpOnly is NOT set. lib/api/client.ts reads the access token through
/// supabase.auth.getSession() in the browser to build the Authorization header
/// for the NestJS API, so making these cookies httpOnly would break every
/// client-side API call. Closing that gap is an architectural change, not a
/// flag; until then the defence against token theft is the absence of XSS plus
/// the CSP in next.config.ts.
export const supabaseCookieOptions: CookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
