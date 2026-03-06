import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge SA — From Not Shortlisted to Job-Ready",
  description:
    "Skills intelligence platform for South African job seekers. Upload a job post and CV, get a competency map, skills assessment, learning plan, and ATS-optimised CV.",
  keywords: ["skills gap", "South Africa", "job readiness", "CV optimiser", "career development"],
  authors: [{ name: "SkillBridge SA" }],
  openGraph: {
    title: "SkillBridge SA",
    description: "From not shortlisted to job-ready. Built for South African job seekers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-midnight text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
