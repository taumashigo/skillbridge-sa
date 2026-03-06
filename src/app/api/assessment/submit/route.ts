import { apiOk, apiErr, parseBody } from "@/lib/utils/api";
import { AssessmentSubmitSchema } from "@/lib/validators/schemas";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, AssessmentSubmitSchema);
  if ("error" in parsed) return parsed.error;

  const assessment = await prisma.assessment.findFirst({ where: { id: parsed.data.assessmentId, userId } });
  if (!assessment) return apiErr("NOT_FOUND", "Assessment not found", [], 404);

  const questions: any[] = (assessment.questions as any)?.questions || [];
  let totalPoints = 0, earnedPoints = 0;
  const results: any[] = [];

  for (const q of questions) {
    const userAnswer = parsed.data.answers[q.id];
    const pts = q.pointValue || 1;
    totalPoints += pts;
    const correct = q.type === "mcq" && userAnswer === q.correctAnswer;
    if (correct) earnedPoints += pts;
    results.push({ questionId: q.id, correct, userAnswer, correctAnswer: q.correctAnswer, explanation: q.explanation });
  }

  const overallScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const submission = await prisma.assessmentSubmission.create({
    data: {
      assessmentId: parsed.data.assessmentId,
      answers: parsed.data.answers as any,
      scores: { results, earnedPoints, totalPoints } as any,
      overallScore,
      feedback: { results } as any,
    },
  });

  return apiOk({ submissionId: submission.id, overallScore, earnedPoints, totalPoints, results });
}
