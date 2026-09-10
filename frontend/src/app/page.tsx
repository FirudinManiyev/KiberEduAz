import type { Metadata } from "next";
import { CertificateSection } from "@/components/landing/certificate-section";
import { ContentStructure } from "@/components/landing/content-structure";
import { GamificationSection } from "@/components/landing/gamification-section";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTicker } from "@/components/landing/landing-ticker";
import { LearningLoop } from "@/components/landing/learning-loop";
import { RolesSection } from "@/components/landing/roles-section";
import { RoomTypes } from "@/components/landing/room-types";
import { SafetySection } from "@/components/landing/safety-section";
import { apiFetchOrNull } from "@/lib/api/server";
import type { MyProfile } from "@/lib/api/types";

const TITLE = "KiberEduAz — məktəblər üçün kibertəhlükəsizlik təlim platforması";
const DESCRIPTION =
  "Məktəb və kolleclərdə İT və kibertəhlükəsizlik təlimlərini rəqəmsal təşkil et: oxu, ssenari üzərində praktika et, cavabın yoxlanılsın və xal qazan. Real virtual maşın yoxdur — simulyasiya əsaslı, təhlükəsiz mühit.";

export const metadata: Metadata = {
  // Overrides the layout template so the landing title reads as a full sentence.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: "KiberEduAz",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/// The marketing landing page stays public for both anonymous and signed-in
/// visitors; role-specific workspaces remain available from the main nav.
export default async function LandingPage() {
  const profile = await apiFetchOrNull<MyProfile>("/profiles/me");
  const signedIn = Boolean(profile);

  return (
    <main className="flex-1 overflow-hidden">
      <LandingTicker />
      <LandingHero signedIn={signedIn} />

      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <LearningLoop />
        <ContentStructure />
        <RoomTypes />
        <SafetySection />
        <GamificationSection />
        <RolesSection />
        <CertificateSection />
        <LandingCta signedIn={signedIn} />
      </div>
    </main>
  );
}
