import { apiOk, apiErr, auditLog } from "@/lib/utils/api";
import { generateCompetencyMap, analyseMatch, ingestJobFromURL } from "@/lib/services/competency-engine";
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

  const { title, description: inputDescription, sourceUrl, proficiency = "intermediate", timeline = "1_month" } = body;

  let description = inputDescription;

  // If URL provided, try to fetch job text
  if (sourceUrl && !description) {
    const result = await ingestJobFromURL(sourceUrl);
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
      title: title || "Untitled Role",
      description,
      sourceUrl: sourceUrl || null,
      rawText: description,
      proficiency,
      timeline,
    },
  });

  try {
    // Generate competency map (~5-15s)
    const compResult = await generateCompetencyMap(
      title || "Untitled Role", description, proficiency, `comp-${job.id}`
    );

    await prisma.competencyMap.create({
      data: { jobId: job.id, competencies: compResult as any },
    });

    // Auto-match against latest parsed CV
    let matchScore: number | null = null;
    let gaps: any[] = [];
    let matchOverlaps: any[] = [];
    let atsKeywords: any = null;

    const latestCv = await prisma.cv.findFirst({
      where: { userId, status: "parsed" },
      orderBy: { createdAt: "desc" },
    });

    if (latestCv?.structuredData) {
      const matchResult = await analyseMatch(
        latestCv.structuredData, compResult.competencies, title || "Untitled Role", `match-${job.id}`
      );

      await prisma.matchReport.create({
        data: {
          userId,
          cvId: latestCv.id,
          jobId: job.id,
          overallScore: matchResult.matchReport.overallScore,
          overlaps: matchResult.matchReport.overlaps as any,
          gaps: matchResult.matchReport.gaps as any,
          strengths: matchResult.matchReport.hiddenStrengths as any,
          recommendations: matchResult.matchReport.atsKeywordCoverage as any,
        },
      });

      matchScore = matchResult.matchReport.overallScore;
      gaps = matchResult.matchReport.gaps || [];
      matchOverlaps = matchResult.matchReport.overlaps || [];
      atsKeywords = matchResult.matchReport.atsKeywordCoverage || null;
    }

    await auditLog(prisma, { userId, action: "JOB_INGESTED", resourceType: "job", resourceId: job.id });

    return apiOk({
      id: job.id,
      title: job.title,
      competencies: compResult.competencies,
      competencyCount: compResult.competencies.length,
      roleSummary: compResult.roleSummary,
      senioritySignals: compResult.senioritySignals,
      matchScore,
      gaps,
      overlaps: matchOverlaps,
      atsKeywords,
      status: "complete",
    }, 201);
  } catch (error: any) {
    console.error("[Job Ingest] Error:", error);
    return apiOk({
      id: job.id,
      title: job.title,
      status: "partial",
      error: error.message,
    }, 201);
  }
}
