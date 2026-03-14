import { apiOk, apiErr } from "@/lib/utils/api";
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

  const { message, conversationId } = body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return apiErr("VALIDATION_ERROR", "Message is required");
  }

  try {
    // Gather user context
    const [latestCv, latestJob, latestMatch, latestAssessment] = await Promise.all([
      prisma.cv.findFirst({
        where: { userId, status: "parsed" },
        orderBy: { createdAt: "desc" },
        select: { structuredData: true },
      }),
      prisma.job.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { title: true, description: true, proficiency: true, timeline: true },
      }),
      prisma.matchReport.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { overallScore: true, gaps: true, overlaps: true },
      }),
      prisma.assessmentSubmission.findFirst({
        where: { assessment: { userId } },
        orderBy: { submittedAt: "desc" },
        select: { overallScore: true, scores: true },
      }),
    ]);

    // Load conversation history
    let history: any[] = [];
    if (conversationId) {
      const existing = await prisma.$queryRaw`
        SELECT messages FROM conversations WHERE id = ${conversationId}::uuid AND user_id = ${userId}::uuid LIMIT 1
      ` as any[];
      if (existing?.[0]?.messages) {
        history = existing[0].messages;
      }
    }

    // Build context summary
    const contextParts: string[] = [];

    if (latestCv?.structuredData) {
      const cv = latestCv.structuredData as any;
      contextParts.push(`CANDIDATE CV SUMMARY:
- Name: ${cv.personalInfo?.name || "Unknown"}
- Experience: ${cv.yearsOfExperience || "Unknown"} years
- Education: ${cv.education?.map((e: any) => `${e.qualification} from ${e.institution}`).join("; ") || "Not specified"}
- Technical Skills: ${cv.skills?.technical?.join(", ") || "None listed"}
- Tools: ${cv.skills?.tools?.join(", ") || "None listed"}
- Career Narrative: ${cv.careerNarrative || "Not generated"}
- Recent Roles: ${cv.experience?.slice(0, 3).map((e: any) => `${e.title} at ${e.company}`).join("; ") || "None"}`);
    }

    if (latestJob) {
      contextParts.push(`TARGET ROLE:
- Title: ${latestJob.title}
- Level: ${latestJob.proficiency}
- Timeline: ${latestJob.timeline}
- Description excerpt: ${latestJob.description?.slice(0, 500) || "N/A"}`);
    }

    if (latestMatch) {
      const gaps = (latestMatch.gaps as any[]) || [];
      const overlaps = (latestMatch.overlaps as any[]) || [];
      contextParts.push(`MATCH ANALYSIS:
- Overall Match Score: ${latestMatch.overallScore}%
- Key Strengths: ${overlaps.slice(0, 3).map((o: any) => o.competency).join(", ") || "None identified"}
- Priority Gaps: ${gaps.slice(0, 4).map((g: any) => `${g.competency} (${g.severity})`).join(", ") || "None identified"}`);
    }

    if (latestAssessment) {
      contextParts.push(`LATEST ASSESSMENT:
- Score: ${latestAssessment.overallScore}%`);
    }

    const userContext = contextParts.length > 0
      ? contextParts.join("\n\n")
      : "No CV or job analysis data available yet. The user is new to the platform.";

    // Build conversation for Claude
    const recentHistory = history.slice(-10);
    const fullConversation = recentHistory.map((m: any) =>
      `${m.role === "user" ? "User" : "Coach"}: ${m.content}`
    ).join("\n\n") + `\n\nUser: ${message}`;

    const systemPrompt = `You are the SkillBridge SA Career Coach — a warm, knowledgeable, and honest career advisor who specialises in the South African job market.

YOUR PERSONALITY:
- Encouraging but honest. If someone is underqualified, say so clearly while offering a concrete path.
- Use South African English (favour, colour, organise).
- Reference the user's actual CV data, target role, and skill gaps — never give generic advice.
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail.
- Use practical examples relevant to SA (mention SETA frameworks, NQF levels, BBBEE context where relevant).

YOU KNOW ABOUT:
- South African job market, salary ranges by city (JHB, CPT, DBN, PTA)
- SETA learnerships and NQF qualification levels
- BBBEE and Employment Equity frameworks
- Common SA interview practices and recruitment processes
- Load shedding considerations for remote work

THE USER'S CONTEXT:
${userContext}

RULES:
- Always reference the user's specific situation when giving advice.
- If asked about salary, give SA-specific ranges.
- If asked "should I apply?", give an honest assessment based on their match score and gaps.
- Never make up information about the user — only reference what's in their context.
- If you don't have enough context, ask the user to upload their CV or analyse a job post first.
- Respond in plain text, NOT JSON. Just write your response naturally as a career coach would.`;

    // Call Claude API directly (not through callClaude which tries to parse JSON)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        temperature: 0.6,
        system: systemPrompt,
        messages: [{ role: "user", content: fullConversation }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      throw new Error(`Claude API error ${claudeRes.status}: ${errText}`);
    }

    const claudeData = await claudeRes.json();
    const coachResponse = claudeData.content
      ?.filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n") || "I'm having trouble responding right now. Please try again.";

    // Save conversation
    const updatedMessages = [
      ...history,
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: coachResponse, timestamp: new Date().toISOString() },
    ];

    let convId = conversationId;
    if (convId) {
      await prisma.$executeRaw`
        UPDATE conversations SET messages = ${JSON.stringify(updatedMessages)}::jsonb, updated_at = NOW()
        WHERE id = ${convId}::uuid AND user_id = ${userId}::uuid
      `;
    } else {
      const result = await prisma.$queryRaw`
        INSERT INTO conversations (id, user_id, messages, context, created_at, updated_at)
        VALUES (gen_random_uuid(), ${userId}::uuid, ${JSON.stringify(updatedMessages)}::jsonb, ${JSON.stringify({ jobTitle: latestJob?.title })}::jsonb, NOW(), NOW())
        RETURNING id
      ` as any[];
      convId = result[0]?.id;
    }

    return apiOk({
      response: coachResponse,
      conversationId: convId,
    });
  } catch (error: any) {
    console.error("[Coach] Error:", error);
    return apiErr("COACH_ERROR", error.message || "Failed to get coach response", [], 500);
  }
}
