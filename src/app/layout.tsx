import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge SA — From not shortlisted to job-ready",
  description: "AI-powered career intelligence platform for South African job seekers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
