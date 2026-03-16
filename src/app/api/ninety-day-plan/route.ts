import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { jobId } = body;
  if (!jobId) return apiErr("VALIDATION_ERROR", "jobId is required");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return apiErr("NOT_FOUND", "Job not found", [], 404);

  const matchReport = await prisma.matchReport.findFirst({ where: { jobId, userId }, orderBy: { createdAt: "desc" } });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const gaps = (matchReport?.gaps as any[]) || [];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0.4,
        system: "You are a career strategist helping new hires make a strong first impression. Create actionable 30-60-90 day plans. Use UK English. Output valid JSON only.",
        messages: [{ role: "user", content: `Generate a 30-60-90 day plan for someone starting in this role.

ROLE: ${job.title}
DESCRIPTION: ${job.description?.slice(0, 1000) || "N/A"}
DEVELOPMENT AREAS: ${gaps.slice(0, 4).map((g: any) => g.competency).join(", ") || "None identified"}

Return JSON:
{
  "overview": "string - 2-3 sentence overview of the plan's strategy",
  "days30": {
    "theme": "string - e.g. 'Learn & Listen'",
    "goals": ["string - specific goals"],
    "relationships": ["string - who to build relationships with"],
    "quickWins": ["string - easy wins to demonstrate value"],
    "learningFocus": ["string - what to study/understand"]
  },
  "days60": {
    "theme": "string - e.g. 'Contribute & Build'",
    "goals": ["string"],
    "projects": ["string - projects to take on"],
    "metrics": ["string - what to measure"],
    "skillDevelopment": ["string - skills to develop"]
  },
  "days90": {
    "theme": "string - e.g. 'Lead & Optimise'",
    "goals": ["string"],
    "initiatives": ["string - improvements to propose"],
    "metrics": ["string - results to show"],
    "nextSteps": ["string - career growth actions"]
  },
  "presentationTips": ["string - how to present this plan to your manager"]
}` }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return apiOk({ ...parsed, jobTitle: job.title });
  } catch (error: any) {
    console.error("[90-Day Plan] Error:", error);
    return apiErr("PLAN_ERROR", error.message || "Failed to generate plan", [], 500);
  }
}
