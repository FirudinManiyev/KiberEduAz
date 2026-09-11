import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, createNonce, CSP_HEADER } from "@/lib/security/csp";
import { supabaseCookieOptions } from "@/lib/supabase/cookie-options";

/// Routes a visitor without a session may reach: the marketing landing page, the
/// school enquiry form, the auth screens and the SEO metadata routes.
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/auth",
  "/about",
  "/contact",
  "/faq",
  "/opengraph-image",
  "/robots.txt",
  "/sitemap.xml",
];

export async function proxy(request: NextRequest) {
  // One nonce per response. It travels on the *request* headers too, which is
  // how Next.js App Router learns to stamp it onto the inline scripts it emits;
  // the CSP in the response is what the browser then checks them against.
  const nonce = createNonce();
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(CSP_HEADER, csp);

  const withCsp = (response: NextResponse) => {
    response.headers.set(CSP_HEADER, csp);
    return response;
  };

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((route) => pathname.startsWith(route));
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  // Keep the public frontend preview available before Supabase is configured.
  // Protected routes remain protected and are sent to the sign-in screen.
  if (!hasSupabaseConfig) {
    if (isPublic) return withCsp(response);

    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);

    return withCsp(NextResponse.redirect(redirect));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request: { headers: requestHeaders } });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser revalidates the token with Supabase and refreshes it when needed;
  // getSession alone would trust whatever is in the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);

    return withCsp(NextResponse.redirect(redirect));
  }

  // Signed-in visitors leave auth screens; the public landing page remains
  // available from the logo and navigation for every visitor.
  if (
    user &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/register/teacher" ||
      pathname === "/forgot-password")
  ) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    redirect.search = "";

    return withCsp(NextResponse.redirect(redirect));
  }

  return withCsp(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
