import { createBrowserClient } from "@supabase/ssr";
import { supabaseCookieOptions } from "./cookie-options";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: supabaseCookieOptions },
  );
}
