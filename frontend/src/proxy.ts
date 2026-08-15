import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/// Routes a visitor without a session may reach: the marketing landing page, the
/// school enquiry form, the auth screens and the SEO metadata routes.
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/contact",
  "/opengraph-image",
  "/robots.txt",
  "/sitemap.xml",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((route) => pathname.startsWith(route));
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  // Keep the public frontend preview available before Supabase is configured.
  // Protected routes remain protected and are sent to the sign-in screen.
  if (!hasSupabaseConfig) {
    if (isPublic) return response;

    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);

    return NextResponse.redirect(redirect);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

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

    return NextResponse.redirect(redirect);
  }

  // Signed-in visitors leave auth screens; the public landing page remains
  // available from the logo and navigation for every visitor.
  if (
    user &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/register/teacher")
  ) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    redirect.search = "";

    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
