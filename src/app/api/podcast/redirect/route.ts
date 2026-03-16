import { apiOk, apiErr } from "@/lib/utils/api";
import { handleRedirect } from "@/lib/services/podcast-orchestrator";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { episodeId, redirectText } = body;
  if (!episodeId || !redirectText) return apiErr("VALIDATION_ERROR", "episodeId and redirectText are required");

  const episode = await prisma.podcastEpisode.findFirst({ where: { id: episodeId, userId } });
  if (!episode) return apiErr("NOT_FOUND", "Episode not found", [], 404);

  try {
    const recentTurns = await prisma.podcastTurn.findMany({
      where: { episodeId: episode.id }, orderBy: { turnNumber: "desc" }, take: 5,
    });

    const compMap = await prisma.competencyMap.findUnique({ where: { jobId: episode.jobId } });
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const competencies: any[] = (compMap?.competencies as any)?.competencies || [];

    const result = await handleRedirect({
      redirectText,
      recentTurns: recentTurns.reverse(),
      competencies,
      userProfile: profile || {},
      currentTurnNumber: recentTurns[0]?.turnNumber || 0,
      requestId: `redir-${episode.id}`,
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

    return apiOk({ newTurns: result.turns, turnCount: result.turns.length });
  } catch (error: any) {
    console.error("[Podcast Redirect] Error:", error);
    return apiErr("REDIRECT_ERROR", error.message || "Failed to redirect podcast", [], 500);
  }
}
