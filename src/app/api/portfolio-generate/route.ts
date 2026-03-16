import { apiOk, apiErr } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { portfolioGenerationPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  const matchReport = await prisma.matchReport.findFirst({ where: { jobId, userId }, orderBy: { createdAt: "desc" } });

  const competencies: any[] = (compMap?.competencies as any)?.competencies || [];
  const gaps: any[] = (matchReport?.gaps as any) || [];

  try {
    const prompt = portfolioGenerationPrompt(competencies, gaps, { yearsExperience: "Not specified" }, job.title);
    const { data } = await callClaude({
      system: prompt.system,
      userMessage: prompt.userMessage,
      maxTokens: 8192,
      temperature: 0.5,
      requestId: `portfolio-${jobId}`,
    });

    return apiOk({
      projects: (data as any).projects || [],
      jobTitle: job.title,
    });
  } catch (error: any) {
    console.error("[Portfolio] Error:", error);
    return apiErr("GENERATION_ERROR", error.message || "Failed to generate portfolio briefs", [], 500);
  }
}
