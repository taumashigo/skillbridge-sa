import { apiOk, apiErr } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { learningRecommendationsPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return apiErr("UNAUTHORIZED", "Please sign in", [], 401);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return apiErr("VALIDATION_ERROR", "Invalid request body");
  }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const matchReport = await prisma.matchReport.findFirst({
    where: { jobId, userId },
    orderBy: { createdAt: "desc" },
  });

  const gaps: any[] = (matchReport?.gaps as any) || [];

  try {
    const prompt = learningRecommendationsPrompt(
      gaps,
      profile || { educationLevel: "Not specified", yearsExperience: "Not specified", hoursPerWeek: 10, deviceType: "mobile", bandwidth: "medium", budget: "free", avoidPrefs: [] },
      job.timeline || "1_month"
    );

    const { data, usage } = await callClaude({
      system: prompt.system,
      userMessage: prompt.userMessage,
      maxTokens: 8192,
      temperature: 0.4,
      requestId: `learn-${jobId}`,
    });

    return apiOk({
      learningPlan: (data as any).learningPlan || null,
      resources: (data as any).resources || [],
      institutions: (data as any).institutions || [],
      jobTitle: job.title,
      gapCount: gaps.length,
    });
  } catch (error: any) {
    console.error("[Learning] Error:", error);
    return apiErr("LEARNING_ERROR", error.message || "Failed to generate learning plan", [], 500);
  }
}
