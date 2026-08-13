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

  // Signed-in visitors leave marketing/auth screens; role-specific home is
  // resolved after /profiles/me on the destination page.
  if (
    user &&
    (pathname === "/" ||
      pathname === "/login" ||
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
