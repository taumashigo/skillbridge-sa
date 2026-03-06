import { apiOk, apiErr, rateLimit } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { assessmentGenerationPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const { jobId } = await request.json();

  const rl = rateLimit(`assess-gen:${userId}`, 3, 60000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", "Too many requests", [], 429);

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  if (!compMap) return apiErr("NOT_FOUND", "Competency map not found. Ingest a job first.", [], 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  const competencies: any[] = (compMap.competencies as any)?.competencies || compMap.competencies as any[] || [];
  const compNames = competencies.slice(0, 6).map((c: any) => c.name).join(", ");
  const jobContext = competencies.slice(0, 6).map((c: any) => `${c.name}: ${c.definition || ""}`).join("; ");

  const prompt = assessmentGenerationPrompt(compNames, job?.proficiency || "intermediate", jobContext);
  const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, requestId: `assess-${jobId}` });

  const assessment = await prisma.assessment.create({
    data: { userId, jobId, competency: compNames, questions: data as any, status: "ready" },
  });

  return apiOk({ id: assessment.id, questionCount: (data as any).questions?.length || 0, status: "ready" }, 201);
}
