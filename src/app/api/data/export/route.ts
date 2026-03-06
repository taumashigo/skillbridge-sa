export const dynamic = "force-dynamic";
import { apiOk } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function GET() {
  const userId = getUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      cvs: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true, status: true, createdAt: true } },
      jobs: { select: { id: true, title: true, proficiency: true, timeline: true, createdAt: true } },
      matchReports: true,
      assessments: { include: { submissions: true } },
      podcastEpisodes: { include: { turns: true } },
      cvOptimisations: true,
      portfolioProjects: true,
      interviewSessions: true,
    },
  });

  return apiOk({
    exportedAt: new Date().toISOString(),
    format: "POPIA-compliant data export",
    data: user,
  });
}
