import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;

  const cv = await prisma.cv.findFirst({ where: { userId, status: "parsed" }, orderBy: { createdAt: "desc" } });
  if (!cv) return apiErr("NOT_FOUND", "No parsed CV found", [], 404);

  const job = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const cvData = cv.structuredData as any;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3072,
        temperature: 0.5,
        system: "You are a LinkedIn profile optimisation expert for the South African market. Use UK English. Output valid JSON only.",
        messages: [{ role: "user", content: `Optimise this candidate's LinkedIn profile for recruiter visibility.

CANDIDATE CV DATA:
- Name: ${cvData.personalInfo?.name || "Unknown"}
- Current/Recent Role: ${cvData.experience?.[0]?.title || "N/A"} at ${cvData.experience?.[0]?.company || "N/A"}
- Skills: ${cvData.skills?.technical?.join(", ") || "N/A"}
- Experience: ${cvData.yearsOfExperience || "N/A"} years
- Education: ${cvData.education?.map((e: any) => e.qualification).join(", ") || "N/A"}
${job ? `\nTARGET ROLE: ${job.title}\nDescription: ${job.description?.slice(0, 500) || "N/A"}` : ""}

Return JSON:
{
  "headline": { "current": "string - likely current headline based on CV", "optimised": "string - keyword-rich headline for recruiter search" },
  "summary": { "optimised": "string - 3-4 paragraph About section optimised for the target role" },
  "experienceHighlights": [{ "role": "string", "optimisedBullets": ["string - rewritten with metrics and keywords"] }],
  "profileStrength": { "score": "number 0-100", "improvements": ["string - specific actions to improve score"] },
  "keywordStrategy": { "primary": ["string - must-have keywords"], "secondary": ["string - good-to-have keywords"] },
  "contentPlan": [{ "week": "number", "postTopic": "string", "postTemplate": "string - draft post text" }]
}` }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return apiOk(parsed);
  } catch (error: any) {
    console.error("[LinkedIn] Error:", error);
    return apiErr("GENERATION_ERROR", error.message || "Failed to optimise LinkedIn profile", [], 500);
  }
}
