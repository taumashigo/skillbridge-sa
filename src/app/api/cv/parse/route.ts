import { apiOk, apiErr, auditLog } from "@/lib/utils/api";
import { downloadCvBuffer } from "@/lib/db/supabase";
import { parseCV } from "@/lib/services/cv-parser";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const { cvId } = await request.json();

  const cv = await prisma.cv.findFirst({ where: { id: cvId, userId } });
  if (!cv) return apiErr("NOT_FOUND", "CV not found", [], 404);

  try {
    await prisma.cv.update({ where: { id: cvId }, data: { status: "parsing" } });

    // Download file from Supabase Storage
    const buffer = await downloadCvBuffer(cv.fileKey);

    // Parse: extract text → deterministic skills → LLM structuring
    const result = await parseCV(buffer, cv.fileType || "application/pdf", `cv-parse-${cvId}`);

    // Update DB with results
    await prisma.cv.update({
      where: { id: cvId },
      data: {
        extractedText: result.extractedText,
        structuredData: result.structuredData as any,
        status: "parsed",
      },
    });

    await auditLog(prisma, {
      userId, action: "CV_PARSED", resourceType: "cv", resourceId: cvId,
      metadata: { skillsFound: result.skills.length, tokensUsed: result.usage.totalTokens },
    });

    return apiOk({ id: cvId, status: "parsed", skillsFound: result.skills.length, structured: result.structuredData });
  } catch (error: any) {
    await prisma.cv.update({ where: { id: cvId }, data: { status: "error" } }).catch(() => {});
    return apiErr("PARSE_ERROR", error.message || "CV parsing failed", [], 500);
  }
}
