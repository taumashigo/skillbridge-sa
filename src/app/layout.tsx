import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/provider";
import { QueryProvider } from "@/lib/hooks/query-provider";
import { ToastWrapper } from "./toast-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge SA — From not shortlisted to job-ready",
  description: "AI-powered career intelligence platform for South African job seekers. CV analysis, skills assessment, interview prep, and personalised learning plans.",
  keywords: ["job search", "South Africa", "CV", "skills assessment", "career", "interview prep", "SETA", "learnerships"],
  authors: [{ name: "SkillBridge SA" }],
  openGraph: {
    title: "SkillBridge SA — AI Career Intelligence",
    description: "From not shortlisted to job-ready. AI-powered CV analysis, skills gaps, learning plans, and interview prep for SA job seekers.",
    type: "website",
    locale: "en_ZA",
    siteName: "SkillBridge SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge SA — AI Career Intelligence",
    description: "From not shortlisted to job-ready. Built for South African job seekers.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0f1e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToastWrapper />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
