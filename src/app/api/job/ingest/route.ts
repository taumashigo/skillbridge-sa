import { apiOk, apiErr, parseBody, rateLimit, auditLog } from "@/lib/utils/api";
import { JobInputSchema } from "@/lib/validators/schemas";
import { generateCompetencyMap, analyseMatch, ingestJobFromURL } from "@/lib/services/competency-engine";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, JobInputSchema);
  if ("error" in parsed) return parsed.error;

  const rl = rateLimit(`job-ingest:${userId}`, 5, 60000);
  if (!rl.allowed) return apiErr("RATE_LIMITED", `Too many requests. Retry in ${rl.retryAfter}s`, [], 429);

  let description = parsed.data.description;

  // If URL provided, try to fetch job text
  if (parsed.data.sourceUrl && !description) {
    const result = await ingestJobFromURL(parsed.data.sourceUrl);
    if (result.success) {
      description = result.text;
    } else {
      return apiErr("SCRAPE_FAILED", result.error || "Could not fetch job URL");
    }
  }

  if (!description || description.length < 50) {
    return apiErr("VALIDATION_ERROR", "Job description is too short. Please provide more detail.");
  }

  // Create job record
  const job = await prisma.job.create({
    data: {
      userId,
      title: parsed.data.title,
      description,
      sourceUrl: parsed.data.sourceUrl,
      rawText: description,
      proficiency: parsed.data.proficiency,
      timeline: parsed.data.timeline,
    },
  });

  try {
    // Generate competency map (inline, ~5-15s)
    const compResult = await generateCompetencyMap(
      parsed.data.title, description, parsed.data.proficiency, `comp-${job.id}`
    );

    await prisma.competencyMap.create({
      data: { jobId: job.id, competencies: compResult as any },
    });

    // Auto-match against latest CV if available
    let matchReport = null;
    const latestCv = await prisma.cv.findFirst({
      where: { userId, status: "parsed" },
      orderBy: { createdAt: "desc" },
    });

    if (latestCv?.structuredData) {
      const matchResult = await analyseMatch(
        latestCv.structuredData, compResult.competencies, parsed.data.title, `match-${job.id}`
      );
      matchReport = await prisma.matchReport.create({
        data: {
          userId, cvId: latestCv.id, jobId: job.id,
          overallScore: matchResult.matchReport.overallScore,
          overlaps: matchResult.matchReport.overlaps as any,
          gaps: matchResult.matchReport.gaps as any,
          strengths: matchResult.matchReport.hiddenStrengths as any,
          recommendations: matchResult.matchReport.atsKeywordCoverage as any,
        },
      });
    }

    await auditLog(prisma, { userId, action: "JOB_INGESTED", resourceType: "job", resourceId: job.id });

    return apiOk({
      id: job.id,
      title: job.title,
      competencyCount: compResult.competencies.length,
      matchScore: matchReport?.overallScore || null,
      status: "complete",
    }, 201);

  } catch (error: any) {
    // Job was created but analysis failed — return partial success
    return apiOk({
      id: job.id,
      title: job.title,
      status: "partial",
      error: error.message,
    }, 201);
  }
}
