import { apiOk, apiErr, auditLog } from "@/lib/utils/api";
import { downloadCvBuffer } from "@/lib/db/supabase";
import { parseCV } from "@/lib/services/cv-parser";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { callClaude } from "@/lib/ai/claude-client";

export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return apiErr("UNAUTHORIZED", "Please sign in", [], 401);
  }

  const { cvId } = await request.json();
  if (!cvId) return apiErr("VALIDATION_ERROR", "cvId is required");

  const cv = await prisma.cv.findFirst({ where: { id: cvId, userId } });
  if (!cv) return apiErr("NOT_FOUND", "CV not found", [], 404);

  try {
    await prisma.cv.update({ where: { id: cvId }, data: { status: "parsing" } });

    // Download file from Supabase Storage
    const buffer = await downloadCvBuffer(cv.fileKey);

    // Parse: extract text -> deterministic skills -> LLM structuring
    const result = await parseCV(buffer, cv.fileType || "application/pdf", `cv-parse-${cvId}`);

    // Generate Career Narrative Summary
    let careerNarrative = "";
    try {
      const narrativeResult = await callClaude({
        system: "You are a career analyst. Write a concise 3-sentence career narrative summary based on the CV data. Use UK English. Output only the narrative text, no JSON.",
        userMessage: `Based on this parsed CV, write a 3-sentence career narrative covering: (1) career trajectory, (2) key strengths, (3) likely next career moves.

CV Data:
${JSON.stringify(result.structuredData, null, 2)}`,
        maxTokens: 300,
        temperature: 0.4,
        requestId: `narrative-${cvId}`,
      });
      careerNarrative = narrativeResult.rawText || "";
    } catch (e) {
      console.warn("[CV Parse] Narrative generation failed, continuing without it:", e);
    }

    // Calculate CV quality score
    const qualityScore = calculateCVQuality(result.structuredData);

    // Update DB with results
    await prisma.cv.update({
      where: { id: cvId },
      data: {
        extractedText: result.extractedText,
        structuredData: {
          ...result.structuredData,
          careerNarrative,
          qualityScore,
        } as any,
        status: "parsed",
      },
    });

    await auditLog(prisma, {
      userId,
      action: "CV_PARSED",
      resourceType: "cv",
      resourceId: cvId,
      metadata: {
        skillsFound: result.skills.length,
        tokensUsed: result.usage.totalTokens,
        qualityScore: qualityScore.overall,
      },
    });

    return apiOk({
      id: cvId,
      status: "parsed",
      skillsFound: result.skills.length,
      structured: result.structuredData,
      careerNarrative,
      qualityScore,
      deterministicSkills: result.skills,
    });
  } catch (error: any) {
    await prisma.cv.update({ where: { id: cvId }, data: { status: "error" } }).catch(() => {});
    console.error("[CV Parse] Error:", error);
    return apiErr("PARSE_ERROR", error.message || "CV parsing failed", [], 500);
  }
}

/**
 * Calculate a CV quality score (0-100) across multiple dimensions.
 */
function calculateCVQuality(structured: any) {
  let clarity = 50;
  let impact = 30;
  let keywords = 40;
  let structure = 50;
  let ats = 50;

  // Clarity: has summary, clear role descriptions
  if (structured.summary) clarity += 15;
  if (structured.experience?.length > 0) clarity += 15;
  if (structured.experience?.every((e: any) => e.description?.length > 20)) clarity += 20;

  // Impact: has quantified achievements
  const allText = JSON.stringify(structured).toLowerCase();
  const hasNumbers = (allText.match(/\d+%|\d+x|\$\d+|\d+ (hours|days|people|users|clients)/g) || []).length;
  impact += Math.min(hasNumbers * 10, 50);
  if (structured.achievements?.length > 0) impact += 20;

  // Keywords: technical skills present
  const techSkills = structured.skills?.technical?.length || 0;
  const tools = structured.skills?.tools?.length || 0;
  keywords += Math.min((techSkills + tools) * 5, 50);

  // Structure: has key sections
  if (structured.personalInfo?.email) structure += 10;
  if (structured.education?.length > 0) structure += 15;
  if (structured.certifications?.length > 0) structure += 15;
  if (structured.projects?.length > 0) structure += 10;

  // ATS: parseable format indicators
  if (structured.personalInfo?.name) ats += 10;
  if (structured.personalInfo?.email) ats += 10;
  if (structured.experience?.every((e: any) => e.startDate)) ats += 15;
  if (techSkills > 3) ats += 15;

  const scores = {
    clarity: Math.min(clarity, 100),
    impact: Math.min(impact, 100),
    keywords: Math.min(keywords, 100),
    structure: Math.min(structure, 100),
    ats: Math.min(ats, 100),
  };

  return {
    ...scores,
    overall: Math.round(
      (scores.clarity + scores.impact + scores.keywords + scores.structure + scores.ats) / 5
    ),
  };
}
