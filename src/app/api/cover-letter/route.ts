import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId, tone = "formal" } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const cv = await prisma.cv.findFirst({ where: { userId, status: "parsed" }, orderBy: { createdAt: "desc" } });
  if (!cv) return apiErr("NOT_FOUND", "No parsed CV found", [], 404);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  const matchReport = await prisma.matchReport.findFirst({ where: { jobId, userId }, orderBy: { createdAt: "desc" } });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const cvData = cv.structuredData as any;
    const overlaps = (matchReport?.overlaps as any[]) || [];
    const toneGuide = tone === "formal" ? "Professional and corporate. Use formal language suitable for large companies and government." : tone === "conversational" ? "Warm and personable. Suitable for startups and smaller companies. Show personality." : "Bold and creative. Show confidence and flair. Suitable for creative industries and agencies.";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        temperature: 0.5,
        system: `You are an expert cover letter writer for the South African job market. Write compelling, tailored cover letters. Use UK English. Output valid JSON only.`,
        messages: [{ role: "user", content: `Write a cover letter for this candidate applying to this role.

CANDIDATE:
- Name: ${cvData.personalInfo?.name || "the candidate"}
- Recent Role: ${cvData.experience?.[0]?.title || "N/A"} at ${cvData.experience?.[0]?.company || "N/A"}
- Key Skills: ${cvData.skills?.technical?.slice(0, 8).join(", ") || "N/A"}
- Key Strengths matching this role: ${overlaps.slice(0, 3).map((o: any) => o.competency).join(", ") || "N/A"}

TARGET ROLE:
- Title: ${job.title}
- Description: ${job.description?.slice(0, 1000) || "N/A"}

TONE: ${toneGuide}

Return JSON:
{
  "coverLetter": "string - the full cover letter text with proper paragraphs",
  "subject": "string - suggested email subject line",
  "keyPointsHighlighted": ["string - which achievements were emphasised"]
}` }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return apiOk({ ...parsed, tone, jobTitle: job.title });
  } catch (error: any) {
    console.error("[Cover Letter] Error:", error);
    return apiErr("GENERATION_ERROR", error.message || "Failed to generate cover letter", [], 500);
  }
}
