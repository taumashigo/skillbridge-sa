import { apiOk, apiErr, rateLimit } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { learningRecommendationsPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const { jobId } = await request.json();

  const rl = rateLimit(`learn:${userId}`, 3, 60000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", "Too many requests", [], 429);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  const matchReport = await prisma.matchReport.findFirst({ where: { jobId, userId }, orderBy: { createdAt: "desc" } });

  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  const gaps: any[] = (matchReport?.gaps as any) || [];
  const prompt = learningRecommendationsPrompt(gaps, profile || {}, job.timeline || "1_month");
  const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, maxTokens: 8192, requestId: `learn-${jobId}` });

  return apiOk(data);
}
