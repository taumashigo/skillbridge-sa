import { apiOk, apiErr, parseBody } from "@/lib/utils/api";
import { PodcastRedirectSchema } from "@/lib/validators/schemas";
import { handleRedirect } from "@/lib/services/podcast-orchestrator";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, PodcastRedirectSchema);
  if ("error" in parsed) return parsed.error;

  const episode = await prisma.podcastEpisode.findFirst({ where: { id: parsed.data.episodeId, userId } });
  if (!episode) return apiErr("NOT_FOUND", "Episode not found", [], 404);

  const recentTurns = await prisma.podcastTurn.findMany({
    where: { episodeId: episode.id }, orderBy: { turnNumber: "desc" }, take: 5,
  });

  const compMap = await prisma.competencyMap.findUnique({ where: { jobId: episode.jobId } });
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const competencies: any[] = (compMap?.competencies as any)?.competencies || [];

  const result = await handleRedirect({
    redirectText: parsed.data.redirectText,
    recentTurns: recentTurns.reverse(),
    competencies, userProfile: profile || {},
    currentTurnNumber: recentTurns[0]?.turnNumber || 0,
    requestId: `redir-${episode.id}`,
  });

  for (const turn of result.turns) {
    await prisma.podcastTurn.create({ data: { episodeId: episode.id, ...turn } });
  }

  return apiOk({ newTurns: result.turns, turnCount: result.turns.length });
}
