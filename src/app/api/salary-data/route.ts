import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;

  const job = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;
  const cv = await prisma.cv.findFirst({ where: { userId, status: "parsed" }, orderBy: { createdAt: "desc" } });
  const cvData = cv?.structuredData as any;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3072,
        temperature: 0.4,
        system: "You are a South African employment and compensation expert. Provide accurate, current SA salary data and BBBEE context. Use UK English. Output valid JSON only.",
        messages: [{ role: "user", content: `Provide comprehensive SA employment intelligence for this candidate and role.

CANDIDATE:
- Experience: ${cvData?.yearsOfExperience || "Unknown"} years
- Skills: ${cvData?.skills?.technical?.slice(0, 6).join(", ") || "N/A"}
- Education: ${cvData?.education?.[0]?.qualification || "N/A"}

TARGET ROLE: ${job?.title || "Not specified"}

Return JSON:
{
  "salaryData": {
    "entry": { "min": "number", "max": "number" },
    "mid": { "min": "number", "max": "number" },
    "senior": { "min": "number", "max": "number" },
    "note": "string - data context"
  },
  "cityComparison": [
    { "city": "string", "adjustmentPercent": "number relative to JHB", "costOfLiving": "string", "demandLevel": "high|medium|low" }
  ],
  "bbbeeContext": {
    "overview": "string - what BBBEE means for job seekers",
    "designationAdvantage": "string - how designated groups benefit",
    "eeTargets": "string - typical EE targets in this industry",
    "skillsDevelopment": "string - how skills dev contributes to BBBEE scorecard",
    "learnershipsLink": "string - how learnerships help employers meet BBBEE targets"
  },
  "employmentLaw": {
    "probation": "string - typical probation period",
    "noticePeriod": "string - standard notice",
    "leave": { "annual": "string", "sick": "string", "family": "string" },
    "uif": "string - UIF contribution info",
    "taxBrackets": "string - relevant SARS info"
  },
  "industryInsights": {
    "demandTrend": "string - growing/stable/declining",
    "topEmployers": ["string - major employers in SA for this role"],
    "remoteWorkTrend": "string - remote work adoption in this sector",
    "loadSheddingImpact": "string - how load shedding affects this industry"
  }
}` }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return apiOk({ ...parsed, jobTitle: job?.title });
  } catch (error: any) {
    console.error("[SA Data] Error:", error);
    return apiErr("SA_DATA_ERROR", error.message || "Failed to load SA employment data", [], 500);
  }
}
