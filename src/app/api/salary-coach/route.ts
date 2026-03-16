import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId, scenario = "initial_offer" } = body;

  const job = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;
  const cv = await prisma.cv.findFirst({ where: { userId, status: "parsed" }, orderBy: { createdAt: "desc" } });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const cvData = cv?.structuredData as any;
    const scenarioGuide: any = {
      initial_offer: "The user has received an initial offer and wants to know if it's fair and how to respond.",
      counter_offer: "The user wants to counter an offer they've received.",
      expectations: "The user is being asked 'What are your salary expectations?' in an interview.",
      benefits: "The user wants to negotiate beyond base salary — benefits, remote work, leave, etc.",
    };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3072,
        temperature: 0.5,
        system: "You are a salary negotiation expert specialising in the South African job market. Provide specific, actionable advice with real SA salary ranges. Use UK English. Output valid JSON only.",
        messages: [{ role: "user", content: `Provide salary negotiation guidance for this candidate.

CANDIDATE:
- Experience: ${cvData?.yearsOfExperience || "Unknown"} years
- Current/Recent Role: ${cvData?.experience?.[0]?.title || "N/A"}
- Skills: ${cvData?.skills?.technical?.slice(0, 6).join(", ") || "N/A"}

TARGET ROLE: ${job?.title || "Not specified"}
${job?.description ? `Description excerpt: ${job.description.slice(0, 500)}` : ""}

SCENARIO: ${scenarioGuide[scenario] || scenarioGuide.initial_offer}

Return JSON:
{
  "salaryRange": {
    "minimum": "string - ZAR amount",
    "midpoint": "string - ZAR amount",
    "maximum": "string - ZAR amount",
    "note": "string - how this was estimated"
  },
  "cityRanges": {
    "johannesburg": "string - range",
    "capeTown": "string - range",
    "durban": "string - range",
    "pretoria": "string - range",
    "remote": "string - range"
  },
  "negotiationScript": ["string - step by step what to say"],
  "commonPushbacks": [
    { "pushback": "string - what the employer might say", "response": "string - how to respond" }
  ],
  "totalCompensation": {
    "baseSalary": "string - range",
    "medicalAid": "string - typical employer contribution",
    "retirement": "string - typical contribution",
    "leave": "string - standard",
    "bonus": "string - if typical for this role",
    "uifDeduction": "string - note about UIF",
    "taxBracket": "string - approximate SARS tax bracket"
  },
  "tips": ["string - SA-specific negotiation tips"]
}` }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return apiOk({ ...parsed, scenario, jobTitle: job?.title });
  } catch (error: any) {
    console.error("[Salary Coach] Error:", error);
    return apiErr("SALARY_ERROR", error.message || "Failed to generate salary advice", [], 500);
  }
}
