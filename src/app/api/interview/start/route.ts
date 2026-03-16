import { apiOk, apiErr } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { interviewQuestionsPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!compMap || !job) return apiErr("NOT_FOUND", "Job or competencies not found", [], 404);

  try {
    const competencies: any[] = (compMap.competencies as any)?.competencies || [];
    const prompt = interviewQuestionsPrompt(competencies, job.title, job.proficiency || "intermediate");
    const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, maxTokens: 4096, requestId: `interview-${jobId}` });

    const session = await prisma.interviewSession.create({
      data: { userId, jobId, questions: data as any },
    });

    return apiOk({
      sessionId: session.id,
      questions: (data as any).questions || [],
      generalTips: (data as any).generalTips || [],
    }, 201);
  } catch (error: any) {
    console.error("[Interview Start] Error:", error);
    return apiErr("GENERATION_ERROR", error.message || "Failed to generate interview questions", [], 500);
  }
}
