import { apiOk, apiErr } from "@/lib/utils/api";
import { callClaude } from "@/lib/ai/claude-client";
import { cvOptimisationPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const cv = await prisma.cv.findFirst({ where: { userId, status: "parsed" }, orderBy: { createdAt: "desc" } });
  if (!cv) return apiErr("NOT_FOUND", "No parsed CV found. Upload and parse your CV first.", [], 404);

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!compMap || !job) return apiErr("NOT_FOUND", "Job or competency map not found", [], 404);

  try {
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

    return apiOk({
      id: opt.id,
      keywordReport: (data as any).keywordReport,
      bulletRewrites: (data as any).bulletRewrites || [],
      missingSections: (data as any).missingSections || [],
      atsVersion: (data as any).atsVersion || "",
      humanVersion: (data as any).humanVersion || "",
    }, 201);
  } catch (error: any) {
    console.error("[CV Optimise] Error:", error);
    return apiErr("OPTIMISE_ERROR", error.message || "Failed to optimise CV", [], 500);
  }
}
