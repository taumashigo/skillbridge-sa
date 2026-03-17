import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    services: {},
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = { status: "ok" };
  } catch (error: any) {
    checks.services.database = { status: "error", message: error.message };
    checks.status = "degraded";
  }

  // Anthropic API check (just verify key exists)
  checks.services.anthropic = {
    status: process.env.ANTHROPIC_API_KEY ? "ok" : "error",
    message: process.env.ANTHROPIC_API_KEY ? "Key configured" : "Key missing",
  };

  // Supabase Storage check
  checks.services.storage = {
    status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "error",
  };

  // Resend check
  checks.services.email = {
    status: process.env.RESEND_API_KEY ? "ok" : "error",
  };

  const httpStatus = checks.status === "ok" ? 200 : 503;
  return NextResponse.json(checks, { status: httpStatus });
}
