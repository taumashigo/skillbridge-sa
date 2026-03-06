import { apiOk, apiErr, rateLimit } from "@/lib/utils/api";
import { createEpisode } from "@/lib/services/podcast-orchestrator";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const { jobId } = await request.json();

  const rl = rateLimit(`podcast:${userId}`, 3, 300000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", "Too many podcast requests", [], 429);

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

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
    await prisma.podcastTurn.create({ data: { episodeId: episode.id, ...turn } });
  }

  return apiOk({ id: episode.id, title: result.title, turnCount: result.turns.length, status: "ready" }, 201);
}
