import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { sector, skills, jobTitle } = body;

  try {
    // Search by sector match or keyword match
    const searchTerm = sector || jobTitle || (skills?.join(" ") || "");
    
    const results = await prisma.$queryRaw`
      SELECT * FROM seta_learnerships 
      WHERE LOWER(sector) LIKE ${"%" + searchTerm.toLowerCase() + "%"}
      OR LOWER(programme) LIKE ${"%" + searchTerm.toLowerCase() + "%"}
      OR LOWER(seta_name) LIKE ${"%" + searchTerm.toLowerCase() + "%"}
      ORDER BY seta_name, programme
      LIMIT 20
    ` as any[];

    // If no results from direct match, use AI to find relevant SETAs
    if (results.length === 0 && jobTitle) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          temperature: 0.3,
          system: "You are an expert on South African SETA (Sector Education and Training Authority) system. Output valid JSON only.",
          messages: [{ role: "user", content: `For the job title "${jobTitle}" with skills: ${skills?.join(", ") || "general"}, which South African SETAs and learnerships are most relevant?

Return JSON:
{
  "recommendations": [
    {
      "seta": "string - SETA name",
      "programme": "string - relevant programme",
      "relevance": "string - why this is relevant",
      "nqfLevel": "number",
      "applicationTip": "string - how to apply"
    }
  ],
  "bbbeeNote": "string - how learnerships contribute to BBBEE scoring",
  "fundingInfo": "string - information about NSF and SETA funding"
}` }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);

      return apiOk({ source: "ai", ...parsed });
    }

    return apiOk({ source: "database", learnerships: results, count: results.length });
  } catch (error: any) {
    console.error("[SETA Search] Error:", error);
    return apiErr("SETA_ERROR", error.message || "Failed to search SETA data", [], 500);
  }
}
