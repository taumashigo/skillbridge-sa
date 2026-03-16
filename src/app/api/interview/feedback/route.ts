import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  let body: any;
  try { body = await request.json(); } catch { return apiErr("VALIDATION_ERROR", "Invalid request body"); }

  const { sessionId, questionId, answer } = body;
  if (!sessionId || !questionId || !answer) return apiErr("VALIDATION_ERROR", "sessionId, questionId, and answer are required");

  const session = await prisma.interviewSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) return apiErr("NOT_FOUND", "Interview session not found", [], 404);

  const questions: any[] = (session.questions as any)?.questions || [];
  const question = questions.find((q: any) => q.id === questionId);
  if (!question) return apiErr("NOT_FOUND", "Question not found in session", [], 404);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        temperature: 0.4,
        system: "You are a constructive interview coach. Provide specific, actionable feedback on interview answers. Score fairly. Offer an improved draft that preserves the candidate's authentic voice. Use UK English. Output valid JSON only.",
        messages: [{ role: "user", content: `Evaluate this interview answer.

Question: ${question.question}
Competency being assessed: ${question.whatTheyreAssessing || "General"}
Question type: ${question.type || "general"}

Candidate's Answer:
"""
${answer}
"""

Return JSON:
{
  "scores": {
    "structure": { "score": "number 1-10", "note": "string" },
    "clarity": { "score": "number 1-10", "note": "string" },
    "relevance": { "score": "number 1-10", "note": "string" },
    "depth": { "score": "number 1-10", "note": "string" }
  },
  "overallScore": "number 1-10",
  "strengths": ["string"],
  "improvements": ["string"],
  "improvedDraft": "string - rewritten answer preserving candidate voice",
  "hiringManagerPerspective": "string - how a hiring manager would perceive this answer"
}` }],
      }),
    });

    const claudeData = await res.json();
    const text = claudeData.content?.[0]?.text || "";
    const cleaned = text.replace(/```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const feedback = JSON.parse(cleaned);

    // Save answer + feedback
    const answers = (session.answers as any) || {};
    answers[questionId] = answer;
    const allFeedback = (session.feedback as any) || {};
    allFeedback[questionId] = feedback;
    await prisma.interviewSession.update({ where: { id: session.id }, data: { answers, feedback: allFeedback } });

    return apiOk(feedback);
  } catch (error: any) {
    console.error("[Interview Feedback] Error:", error);
    return apiErr("FEEDBACK_ERROR", error.message || "Failed to generate feedback", [], 500);
  }
}
