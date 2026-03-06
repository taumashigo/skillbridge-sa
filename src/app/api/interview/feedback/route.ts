import { apiOk, apiErr, parseBody } from "@/lib/utils/api";
import { InterviewAnswerSchema } from "@/lib/validators/schemas";
import { callClaude } from "@/lib/ai/claude-client";
import { interviewFeedbackPrompt } from "@/lib/ai/prompts";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, InterviewAnswerSchema);
  if ("error" in parsed) return parsed.error;

  const session = await prisma.interviewSession.findFirst({ where: { id: parsed.data.sessionId, userId } });
  if (!session) return apiErr("NOT_FOUND", "Interview session not found", [], 404);

  const questions: any[] = (session.questions as any)?.questions || [];
  const question = questions.find((q: any) => q.id === parsed.data.questionId);
  if (!question) return apiErr("NOT_FOUND", "Question not found in session", [], 404);

  const prompt = interviewFeedbackPrompt(question.question, parsed.data.answer, question.whatTheyreAssessing || "");
  const { data } = await callClaude({ system: prompt.system, userMessage: prompt.userMessage, requestId: `fb-${parsed.data.sessionId}` });

  // Save answer + feedback
  const answers = (session.answers as any) || {};
  answers[parsed.data.questionId] = parsed.data.answer;
  const feedback = (session.feedback as any) || {};
  feedback[parsed.data.questionId] = data;

  await prisma.interviewSession.update({ where: { id: session.id }, data: { answers, feedback } });

  return apiOk(data);
}
