/**
 * SkillBridge SA — Async Job Queue Worker
 * Processes long-running tasks via BullMQ + Redis.
 *
 * Jobs: cv-parse, competency-extract, assessment-generate,
 *       podcast-generate, podcast-redirect, cv-optimise,
 *       learning-recommend
 *
 * Run: node lib/queue/worker.js
 */

// ────────────────────────────────────────────────────────────
// SETUP
// ────────────────────────────────────────────────────────────

const QUEUE_NAME = "skillbridge";

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
};

/**
 * Queue definition (for adding jobs from API handlers).
 *
 * Usage:
 *   import { addJob } from './lib/queue/worker';
 *   await addJob('cv-parse', { cvId, userId, fileKey, fileType });
 */
export async function addJob(name, data, opts = {}) {
  const { Queue } = await import("bullmq");
  const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONFIG });

  await queue.add(name, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
    ...opts,
  });

  await queue.close();
}

// ────────────────────────────────────────────────────────────
// JOB PROCESSORS
// ────────────────────────────────────────────────────────────

const processors = {

  // ── CV Parsing ──────────────────────────────────────────
  "cv-parse": async (job) => {
    const { cvId, userId, fileKey, fileType } = job.data;
    const requestId = `cv-parse-${cvId}`;
    console.log(`[Worker] cv-parse started: ${cvId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { parseCV } = await import("../services/cv-parser.js");
      const storage = await getStorageClient();

      const fileBuffer = await storage.getObject(fileKey);
      const result = await parseCV(fileBuffer, fileType, requestId);

      await prisma.cv.update({
        where: { id: cvId },
        data: {
          extractedText: result.extractedText,
          structuredData: result.structuredData,
          status: "parsed",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "CV_PARSED",
          resourceType: "cv",
          resourceId: cvId,
          metadata: { skillsFound: result.skills.length, tokensUsed: result.usage.totalTokens },
        },
      });

      console.log(`[Worker] cv-parse complete: ${cvId} (${result.skills.length} skills)`);
      return { cvId, status: "parsed", skillsFound: result.skills.length };
    } catch (error) {
      console.error(`[Worker] cv-parse failed: ${cvId}`, error.message);
      await prisma.cv.update({ where: { id: cvId }, data: { status: "error" } }).catch(() => {});
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── Competency Extraction ──────────────────────────────
  "competency-extract": async (job) => {
    const { jobId, title, description, proficiency } = job.data;
    const requestId = `comp-${jobId}`;
    console.log(`[Worker] competency-extract started: ${jobId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { generateCompetencyMap, analyseMatch } = await import("../services/competency-engine.js");

      const result = await generateCompetencyMap(title, description, proficiency, requestId);

      await prisma.competencyMap.upsert({
        where: { jobId },
        create: { jobId, competencies: result },
        update: { competencies: result },
      });

      // Auto-generate match report if CV exists
      const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
      const latestCv = await prisma.cv.findFirst({
        where: { userId: jobRecord.userId, status: "parsed" },
        orderBy: { createdAt: "desc" },
      });

      if (latestCv?.structuredData) {
        const matchResult = await analyseMatch(
          latestCv.structuredData,
          result.competencies,
          title,
          `match-${jobId}`
        );

        await prisma.matchReport.create({
          data: {
            userId: jobRecord.userId,
            cvId: latestCv.id,
            jobId,
            overallScore: matchResult.matchReport.overallScore,
            overlaps: matchResult.matchReport.overlaps,
            gaps: matchResult.matchReport.gaps,
            strengths: matchResult.matchReport.hiddenStrengths,
            recommendations: matchResult.matchReport.atsKeywordCoverage,
          },
        });
      }

      console.log(`[Worker] competency-extract complete: ${jobId} (${result.competencies.length} competencies)`);
      return { jobId, competencyCount: result.competencies.length };
    } catch (error) {
      console.error(`[Worker] competency-extract failed: ${jobId}`, error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── Assessment Generation ──────────────────────────────
  "assessment-generate": async (job) => {
    const { assessmentId, category, competencies, proficiency } = job.data;
    const requestId = `assess-${assessmentId}`;
    console.log(`[Worker] assessment-generate started: ${assessmentId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { callClaude } = await import("../ai/claude-client");
      const { assessmentGenerationPrompt } = await import("../ai/prompts");

      const compNames = competencies.map((c) => c.name).join(", ");
      const jobContext = competencies.map((c) => `${c.name}: ${c.definition || ""}`).join("; ");
      const prompt = assessmentGenerationPrompt(compNames, proficiency, jobContext);

      const { data } = await callClaude({
        system: prompt.system,
        userMessage: prompt.userMessage,
        requestId,
      });

      await prisma.assessment.update({
        where: { id: assessmentId },
        data: { questions: data, status: "ready" },
      });

      console.log(`[Worker] assessment-generate complete: ${assessmentId}`);
      return { assessmentId, questionCount: (data.questions || []).length };
    } catch (error) {
      console.error(`[Worker] assessment-generate failed: ${assessmentId}`, error.message);
      await prisma.assessment.update({ where: { id: assessmentId }, data: { status: "error" } }).catch(() => {});
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── Podcast Generation ─────────────────────────────────
  "podcast-generate": async (job) => {
    const { episodeId, jobId, userId } = job.data;
    const requestId = `podcast-${episodeId}`;
    console.log(`[Worker] podcast-generate started: ${episodeId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { createEpisode } = await import("../services/podcast-orchestrator.js");

      const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
      const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
      const profile = await prisma.profile.findUnique({ where: { userId } });
      const matchReport = await prisma.matchReport.findFirst({
        where: { jobId, userId },
        orderBy: { createdAt: "desc" },
      });

      const competencies = compMap?.competencies?.competencies || compMap?.competencies || [];
      const gaps = matchReport?.gaps || [];

      const result = await createEpisode({
        competencies,
        gaps,
        userProfile: profile || {},
        jobTitle: jobRecord.title,
        requestId,
      });

      await prisma.podcastEpisode.update({
        where: { id: episodeId },
        data: { title: result.title, outline: result.outline, status: "ready" },
      });

      for (const turn of result.turns) {
        await prisma.podcastTurn.create({
          data: { episodeId, ...turn },
        });
      }

      console.log(`[Worker] podcast-generate complete: ${episodeId} (${result.turns.length} turns)`);
      return { episodeId, turnCount: result.turns.length };
    } catch (error) {
      console.error(`[Worker] podcast-generate failed: ${episodeId}`, error.message);
      await prisma.podcastEpisode.update({ where: { id: episodeId }, data: { status: "error" } }).catch(() => {});
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── Podcast Redirect ───────────────────────────────────
  "podcast-redirect": async (job) => {
    const { episodeId, redirectText, recentTurns, currentTurnNumber } = job.data;
    const requestId = `redir-${episodeId}`;
    console.log(`[Worker] podcast-redirect started: ${episodeId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { handleRedirect } = await import("../services/podcast-orchestrator.js");

      const episode = await prisma.podcastEpisode.findUnique({ where: { id: episodeId } });
      const compMap = await prisma.competencyMap.findUnique({ where: { jobId: episode.jobId } });
      const profile = await prisma.profile.findUnique({ where: { userId: episode.userId } });

      const competencies = compMap?.competencies?.competencies || compMap?.competencies || [];

      const result = await handleRedirect({
        redirectText,
        recentTurns,
        competencies,
        userProfile: profile || {},
        currentTurnNumber,
        requestId,
      });

      for (const turn of result.turns) {
        await prisma.podcastTurn.create({
          data: { episodeId, ...turn },
        });
      }

      console.log(`[Worker] podcast-redirect complete: ${episodeId} (+${result.turns.length} turns)`);
      return { episodeId, newTurns: result.turns.length };
    } catch (error) {
      console.error(`[Worker] podcast-redirect failed: ${episodeId}`, error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── CV Optimisation ────────────────────────────────────
  "cv-optimise": async (job) => {
    const { optimisationId, cvId, jobId, userId } = job.data;
    const requestId = `cvopt-${optimisationId}`;
    console.log(`[Worker] cv-optimise started: ${optimisationId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { callClaude } = await import("../ai/claude-client");
      const { cvOptimisationPrompt } = await import("../ai/prompts");

      const cv = await prisma.cv.findUnique({ where: { id: cvId } });
      const compMap = await prisma.competencyMap.findUnique({ where: { jobId } });
      const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });

      if (!cv?.structuredData) throw new Error("CV not parsed yet");

      const competencies = compMap?.competencies?.competencies || compMap?.competencies || [];
      const prompt = cvOptimisationPrompt(cv.structuredData, competencies, jobRecord.title);

      const { data } = await callClaude({
        system: prompt.system,
        userMessage: prompt.userMessage,
        maxTokens: 8192,
        requestId,
      });

      await prisma.cvOptimisation.update({
        where: { id: optimisationId },
        data: {
          keywordReport: data.keywordReport,
          suggestions: data.bulletRewrites,
          atsVersion: data.atsVersion,
          humanVersion: data.humanVersion,
          missingSections: data.missingSections,
        },
      });

      console.log(`[Worker] cv-optimise complete: ${optimisationId}`);
      return { optimisationId };
    } catch (error) {
      console.error(`[Worker] cv-optimise failed: ${optimisationId}`, error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },

  // ── Learning Recommendations ───────────────────────────
  "learning-recommend": async (job) => {
    const { userId, jobId } = job.data;
    const requestId = `learn-${jobId}`;
    console.log(`[Worker] learning-recommend started: ${jobId}`);

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const { callClaude } = await import("../ai/claude-client");
      const { learningRecommendationsPrompt } = await import("../ai/prompts");

      const profile = await prisma.profile.findUnique({ where: { userId } });
      const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
      const matchReport = await prisma.matchReport.findFirst({
        where: { jobId, userId },
        orderBy: { createdAt: "desc" },
      });

      const gaps = matchReport?.gaps || [];
      const prompt = learningRecommendationsPrompt(gaps, profile || {}, jobRecord?.timeline || "1_month");

      const { data } = await callClaude({
        system: prompt.system,
        userMessage: prompt.userMessage,
        maxTokens: 8192,
        requestId,
      });

      // Store resources
      if (data.resources) {
        for (const res of data.resources) {
          await prisma.learningResource.create({
            data: {
              title: res.title,
              type: res.type,
              provider: res.provider,
              url: res.url,
              competencies: [res.competency],
              difficulty: res.difficulty,
              estimatedHours: res.estimatedHours,
              prerequisites: res.prerequisites || [],
              description: res.whyRecommended,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }

      // Store institutions
      if (data.institutions) {
        for (const inst of data.institutions) {
          await prisma.institution.create({
            data: {
              name: inst.name,
              url: inst.url,
              description: inst.description,
              bestFor: inst.bestFor,
              typicalOfferings: inst.typicalOfferings || [],
              recognition: inst.recognition,
              category: inst.category,
              region: inst.region,
            },
          }).catch(() => {}); // Ignore duplicates
        }
      }

      console.log(`[Worker] learning-recommend complete: ${jobId}`);
      return { jobId, resourceCount: data.resources?.length || 0, institutionCount: data.institutions?.length || 0 };
    } catch (error) {
      console.error(`[Worker] learning-recommend failed: ${jobId}`, error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
};

// ────────────────────────────────────────────────────────────
// S3 STORAGE CLIENT
// ────────────────────────────────────────────────────────────

async function getStorageClient() {
  // Minimal S3-compatible client using fetch
  const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
  const bucket = process.env.S3_BUCKET || "skillbridge-uploads";
  const accessKey = process.env.S3_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.S3_SECRET_KEY || "minioadmin";

  return {
    async getObject(key) {
      const url = `${endpoint}/${bucket}/${key}`;
      const response = await fetch(url, {
        headers: { Authorization: `AWS ${accessKey}:${secretKey}` },
      });
      if (!response.ok) throw new Error(`S3 GET failed: ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    },

    async putObject(key, buffer, contentType) {
      const url = `${endpoint}/${bucket}/${key}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `AWS ${accessKey}:${secretKey}`,
          "Content-Type": contentType,
        },
        body: buffer,
      });
      if (!response.ok) throw new Error(`S3 PUT failed: ${response.status}`);
    },

    async deleteObject(key) {
      const url = `${endpoint}/${bucket}/${key}`;
      await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `AWS ${accessKey}:${secretKey}` },
      });
    },
  };
}

// ────────────────────────────────────────────────────────────
// WORKER STARTUP
// ────────────────────────────────────────────────────────────

async function startWorker() {
  const { Worker } = await import("bullmq");

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const processor = processors[job.name];
      if (!processor) {
        console.error(`[Worker] Unknown job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
      }
      return processor(job);
    },
    {
      connection: REDIS_CONFIG,
      concurrency: 3,
      limiter: { max: 5, duration: 60000 }, // Max 5 jobs per minute (LLM cost control)
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`[Worker] Job ${job.name}:${job.id} completed`, result);
  });

  worker.on("failed", (job, error) => {
    console.error(`[Worker] Job ${job.name}:${job.id} failed (attempt ${job.attemptsMade})`, error.message);
  });

  worker.on("error", (error) => {
    console.error("[Worker] Error:", error.message);
  });

  console.log("[Worker] SkillBridge SA worker started. Listening for jobs...");
  console.log(`[Worker] Queue: ${QUEUE_NAME}, Concurrency: 3, Redis: ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`);
}

// Auto-start when run directly
if (typeof process !== "undefined" && process.argv[1]?.includes("worker")) {
  startWorker().catch((err) => {
    console.error("[Worker] Fatal startup error:", err);
    process.exit(1);
  });
}

