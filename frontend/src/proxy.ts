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

const HOME = "/dashboard";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((route) => pathname.startsWith(route));

  if (!user && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);

    return NextResponse.redirect(redirect);
  }

  // A signed-in learner has no use for the marketing page or the auth screens.
  if (user && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = HOME;
    redirect.search = "";

    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
