import { SiteFooter } from "@/components/layout/site-footer";
import { apiFetchOrNull } from "@/lib/api/server";
import type { MyProfile } from "@/lib/api/types";

/// Mirrors the header container so the footer can hide auth-only links for
/// anonymous visitors on the public landing and contact pages.
export async function SiteFooterContainer() {
  const profile = await apiFetchOrNull<MyProfile>("/profiles/me");

  return <SiteFooter signedIn={Boolean(profile)} />;
}
