import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/provider";
import { QueryProvider } from "@/lib/hooks/query-provider";
import { ToastWrapper } from "./toast-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge SA — From not shortlisted to job-ready",
  description: "AI-powered career intelligence platform for South African job seekers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
