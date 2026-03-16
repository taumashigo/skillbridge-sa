import { apiOk, apiErr } from "@/lib/utils/api";
import { createEpisode } from "@/lib/services/podcast-orchestrator";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  try {
    const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const matchReport = await prisma.matchReport.findFirst({ where: { jobId, userId }, orderBy: { createdAt: "desc" } });

    const competencies: any[] = (compMap?.competencies as any)?.competencies || [];
    const gaps: any[] = (matchReport?.gaps as any) || [];

    const result = await createEpisode({
      competencies, gaps, userProfile: profile || {}, jobTitle: job.title, requestId: `podcast-${jobId}`,
    });

    const episode = await prisma.podcastEpisode.create({
      data: { userId, jobId, title: result.title, outline: result.outline as any, status: "ready" },
    });

    for (const turn of result.turns) {
      await prisma.podcastTurn.create({
        data: {
          episodeId: episode.id,
          turnNumber: turn.turnNumber,
          speaker: turn.speaker,
          content: turn.content,
          chapter: turn.chapter,
        },
      });
    }

    return apiOk({
      id: episode.id,
      title: result.title,
      turns: result.turns,
      outline: result.outline,
      turnCount: result.turns.length,
    }, 201);
  } catch (error: any) {
    console.error("[Podcast Create] Error:", error);
    return apiErr("PODCAST_ERROR", error.message || "Failed to create podcast", [], 500);
  }
}
