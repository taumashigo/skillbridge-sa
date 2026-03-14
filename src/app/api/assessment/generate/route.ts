import { apiOk, apiErr } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { assessmentGenerationPrompt } from "@/lib/ai/prompts";
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

  // Find competency map for this job
  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  if (!compMap) return apiErr("NOT_FOUND", "Competency map not found. Analyse a job first.", [], 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  const competencies: any[] = (compMap.competencies as any)?.competencies || compMap.competencies as any[] || [];

  // Focus on top competencies for assessment
  const topComps = competencies.slice(0, 6);
  const compNames = topComps.map((c: any) => c.name).join(", ");
  const jobContext = topComps.map((c: any) => `${c.name}: ${c.definition || ""}`).join("; ");

  try {
    const prompt = assessmentGenerationPrompt(compNames, job?.proficiency || "intermediate", jobContext);
    const { data, usage } = await callClaude({
      system: prompt.system,
      userMessage: prompt.userMessage,
      maxTokens: 4096,
      temperature: 0.4,
      requestId: `assess-${jobId}`,
    });

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        jobId,
        competency: compNames,
        questions: data as any,
        status: "ready",
      },
    });

    return apiOk({
      id: assessment.id,
      questions: (data as any).questions || [],
      questionCount: (data as any).questions?.length || 0,
      estimatedMinutes: (data as any).estimatedMinutes || 15,
      status: "ready",
    }, 201);
  } catch (error: any) {
    console.error("[Assessment Generate] Error:", error);
    return apiErr("GENERATION_ERROR", error.message || "Failed to generate assessment", [], 500);
  }
}
