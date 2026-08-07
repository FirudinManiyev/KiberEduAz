import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
  themeColor: "#070a0d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
