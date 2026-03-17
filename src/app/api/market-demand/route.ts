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

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const jobTitle = job?.title || body.jobTitle || "General";

    // Step 1: Use Claude with web search to find current SA job market data
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0.3,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are a South African job market analyst. Your task is to research the CURRENT job market demand in a specific sector based on real, recent job advertisements on South African job boards (Careers24, Pnet, Indeed SA, LinkedIn SA, OfferZen, etc.).

You MUST use web search to find real, current data. Search for recent job adverts in the relevant sector on SA job boards. Look at multiple sources to build an accurate picture.

After researching, output valid JSON only — no other text.`,
        messages: [{ role: "user", content: `Research the current South African job market for the sector related to "${jobTitle}".

Step 1: Determine which sector this role belongs to (e.g. ICT, Finance, Engineering, Healthcare, etc.)
Step 2: Search SA job boards for recent adverts in that sector
Step 3: Identify the most in-demand specific job titles/roles in that sector right now
Step 4: Rank them by estimated demand (based on number of recent adverts you find)

Search queries to try:
- "${jobTitle} jobs South Africa 2026"
- "[sector] jobs Careers24"
- "[sector] most in demand jobs South Africa"
- "top hiring jobs South Africa [sector] 2026"
- "OfferZen salary survey" or "Pnet salary report" for tech roles

Return JSON:
{
  "sector": "string - the sector name (e.g. Information & Communications Technology)",
  "sectorDescription": "string - 1-2 sentences about this sector in SA right now",
  "dataDate": "string - e.g. March 2026",
  "dataSources": ["string - which job boards/sources were checked"],
  "targetRole": "${jobTitle}",
  "targetRoleRank": "number - where the user's target role ranks in demand",
  "demandRanking": [
    {
      "rank": "number",
      "role": "string - specific job title",
      "estimatedAdverts": "string - e.g. '300+ recent adverts' or 'High volume'",
      "demandLevel": "hot | high | moderate | low | declining",
      "averageSalary": "string - SA salary range if known, e.g. 'R35,000 - R55,000/month'",
      "trend": "string - e.g. 'Growing rapidly due to AI adoption' or 'Stable demand'",
      "isTargetRole": "boolean - true if this matches the user's target role"
    }
  ],
  "marketInsights": {
    "hottestSkills": ["string - skills that appear in the most adverts"],
    "emergingRoles": ["string - new roles appearing that didn't exist 2 years ago"],
    "decliningRoles": ["string - roles seeing fewer adverts"],
    "remoteVsOnsite": "string - what % of adverts offer remote/hybrid",
    "topHiringCities": ["string - cities with most adverts in this sector"],
    "entryLevelAvailability": "string - how many entry-level roles are available"
  },
  "adviceForUser": "string - 2-3 sentences of specific advice based on where their target role ranks and current market conditions"
}

Include at least 10-15 roles in the demand ranking. Be specific with real job titles, not generic categories. Base everything on actual current SA job market data from your web searches.` }],
      }),
    });

    const data = await res.json();

    // Extract the text content (Claude may have done web searches first)
    const textBlocks = data.content?.filter((b: any) => b.type === "text") || [];
    const fullText = textBlocks.map((b: any) => b.text).join("\n");

    // Parse JSON from response
    const cleaned = fullText.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    
    // Try to find JSON in the response
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from mixed text
      const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Could not parse market data from response");
      }
    }

    return apiOk(parsed);
  } catch (error: any) {
    console.error("[Market Demand] Error:", error);
    return apiErr("MARKET_ERROR", error.message || "Failed to fetch market demand data", [], 500);
  }
}
