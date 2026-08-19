import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChromeGate } from "@/components/layout/chrome-gate";
import { SiteFooterContainer } from "@/components/layout/site-footer-container";
import { SiteHeaderContainer } from "@/components/layout/site-header-container";
import { SiteLoader } from "@/components/feedback/site-loader";
import { AppToaster } from "@/components/feedback/app-toaster";
import { GlobalAcidBackground } from "@/components/effects/global-acid-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KiberEduAz — Kibertəhlükəsizlik Təlim Platforması",
    template: "%s · KiberEduAz",
  },
  description:
    "Məktəb və kollec tələbələri üçün ssenari əsaslı İT və kibertəhlükəsizlik təlim platforması.",
  keywords: [
    "kibertəhlükəsizlik",
    "təlim",
    "Azərbaycan",
    "pentestinq",
    "GRC",
    "KiberEduAz",
  ],
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#121416",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteLoader />
        <GlobalAcidBackground />
        <ChromeGate>
          <SiteHeaderContainer />
        </ChromeGate>
        {children}
        <AppToaster />
        <ChromeGate>
          <SiteFooterContainer />
        </ChromeGate>
      </body>
    </html>
  );
}
