import { apiOk, apiErr, parseBody, rateLimit } from "@/lib/utils/api";
import { CvOptimiseSchema } from "@/lib/validators/schemas";
import { callClaude } from "@/lib/ai/claude-client";
import { cvOptimisationPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, CvOptimiseSchema);
  if ("error" in parsed) return parsed.error;

  const rl = rateLimit(`cvopt:${userId}`, 3, 60000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", "Too many requests", [], 429);

  const cv = await prisma.cv.findFirst({ where: { id: parsed.data.cvId, userId, status: "parsed" } });
  if (!cv) return apiErr("NOT_FOUND", "Parsed CV not found", [], 404);

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId: parsed.data.jobId } });
  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!compMap || !job) return apiErr("NOT_FOUND", "Job or competency map not found", [], 404);

  const competencies: any[] = (compMap.competencies as any)?.competencies || [];
  const prompt = cvOptimisationPrompt(cv.structuredData, competencies, job.title);
  const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, maxTokens: 8192, requestId: `cvopt-${cv.id}` });

  const opt = await prisma.cvOptimisation.create({
    data: {
      userId, cvId: cv.id, jobId: job.id,
      keywordReport: (data as any).keywordReport,
      suggestions: (data as any).bulletRewrites,
      atsVersion: (data as any).atsVersion,
      humanVersion: (data as any).humanVersion,
      missingSections: (data as any).missingSections,
    },
  });

  return apiOk({ id: opt.id, keywordReport: (data as any).keywordReport, suggestions: (data as any).bulletRewrites }, 201);
}
