import { apiOk, apiErr, rateLimit } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { interviewQuestionsPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const { jobId } = await request.json();

  const rl = rateLimit(`interview:${userId}`, 3, 60000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", "Too many requests", [], 429);

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!compMap || !job) return apiErr("NOT_FOUND", "Job or competencies not found", [], 404);

  const competencies: any[] = (compMap.competencies as any)?.competencies || [];
  const prompt = interviewQuestionsPrompt(competencies, job.title, job.proficiency || "intermediate");
  const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, requestId: `interview-${jobId}` });

  const session = await prisma.interviewSession.create({
    data: { userId, jobId, questions: data as any },
  });

  return apiOk({ sessionId: session.id, questions: (data as any).questions, generalTips: (data as any).generalTips }, 201);
}
