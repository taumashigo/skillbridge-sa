import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(2).max(255),
  educationLevel: z.string().optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  industries: z.array(z.string()).default([]),
  priorRoles: z.array(z.string()).default([]),
  skillRatings: z.record(z.number().min(1).max(5)).default({}),
  hoursPerWeek: z.number().int().min(1).max(80).default(10),
  deviceType: z.enum(["mobile", "laptop", "tablet", "desktop"]).optional(),
  bandwidth: z.enum(["low", "medium", "high"]).optional(),
  budget: z.enum(["free", "low", "medium", "flexible"]).optional(),
  avoidPrefs: z.array(z.string()).default([]),
});

export const JobInputSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  proficiency: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  timeline: z.enum(["2_weeks", "1_month", "3_months"]).default("1_month"),
}).refine((d) => d.description || d.sourceUrl, { message: "Either description or sourceUrl required" });

export const AssessmentSubmitSchema = z.object({
  assessmentId: z.string().uuid(),
  answers: z.record(z.union([z.number(), z.string()])),
});

export const PodcastRedirectSchema = z.object({
  episodeId: z.string().uuid(),
  redirectText: z.string().min(3).max(500),
});

export const CvOptimiseSchema = z.object({
  cvId: z.string().uuid(),
  jobId: z.string().uuid(),
});

export const InterviewAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  answer: z.string().min(10).max(5000),
});

export const ConsentSchema = z.object({
  consentCv: z.boolean(),
  consentAnalytics: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
export type JobInput = z.infer<typeof JobInputSchema>;
export type AssessmentSubmitInput = z.infer<typeof AssessmentSubmitSchema>;
export type PodcastRedirectInput = z.infer<typeof PodcastRedirectSchema>;
export type CvOptimiseInput = z.infer<typeof CvOptimiseSchema>;
export type InterviewAnswerInput = z.infer<typeof InterviewAnswerSchema>;
