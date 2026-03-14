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

  const { assessmentId, answers } = body;
  if (!assessmentId || !answers) return apiErr("VALIDATION_ERROR", "assessmentId and answers are required");

  const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, userId } });
  if (!assessment) return apiErr("NOT_FOUND", "Assessment not found", [], 404);

  const questions: any[] = (assessment.questions as any)?.questions || [];
  let totalPoints = 0, earnedPoints = 0;
  const results: any[] = [];

  for (const q of questions) {
    const userAnswer = answers[q.id];
    const pts = q.pointValue || 1;
    totalPoints += pts;

    let correct = false;
    if (q.type === "mcq" && userAnswer === q.correctAnswer) {
      correct = true;
      earnedPoints += pts;
    }

    results.push({
      questionId: q.id,
      question: q.question,
      type: q.type,
      correct,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      whatToStudy: q.whatToStudy,
      difficulty: q.difficulty,
    });
  }

  const overallScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const submission = await prisma.assessmentSubmission.create({
    data: {
      assessmentId,
      answers: answers as any,
      scores: { results, earnedPoints, totalPoints } as any,
      overallScore,
      feedback: { results } as any,
    },
  });

  // Update assessment status
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "completed" },
  });

  return apiOk({
    submissionId: submission.id,
    overallScore,
    earnedPoints,
    totalPoints,
    results,
  });
}
