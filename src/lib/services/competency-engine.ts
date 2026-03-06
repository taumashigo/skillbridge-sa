/**
 * SkillBridge SA — Competency Inference Service
 * Hybrid approach: deterministic extraction + LLM inference.
 */

import { callClaude } from "../ai/claude-client";
import { competencyExtractionPrompt, matchAnalysisPrompt } from "../ai/prompts";
import { extractDeterministicSkills } from "./cv-parser";

// ────────────────────────────────────────────────────────────
// JOB INGESTION
// ────────────────────────────────────────────────────────────

/**
 * Fetch and extract content from a job URL.
 * Falls back gracefully if scraping fails.
 */
export async function ingestJobFromURL(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SkillBridgeBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { success: false, error: `Failed to fetch URL (${response.status}). Please paste the job text manually.` };
    }

    const html = await response.text();
    const text = extractTextFromHTML(html);

    if (text.length < 100) {
      return { success: false, error: "Could not extract meaningful text from the page. Please paste the job description." };
    }

    return { success: true, text, sourceUrl: url };
  } catch (error) {
    return { success: false, error: `Could not access the URL: ${error.message}. Please paste the job text.` };
  }
}

/**
 * Basic HTML → text extraction.
 * Strips tags, scripts, styles, and normalises whitespace.
 */
function extractTextFromHTML(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ────────────────────────────────────────────────────────────
// COMPETENCY MAP GENERATION (Hybrid)
// ────────────────────────────────────────────────────────────

/**
 * Generate a competency map for a job.
 * Step 1: Deterministic extraction (instant)
 * Step 2: LLM inference (deep analysis)
 * Step 3: Merge and deduplicate
 */
export async function generateCompetencyMap(jobTitle, jobDescription, proficiency, requestId) {
  // Step 1: Fast deterministic extraction
  const deterministicSkills = extractDeterministicSkills(jobDescription);

  // Step 2: LLM deep analysis
  const prompt = competencyExtractionPrompt(jobTitle, jobDescription, proficiency);
  const { data: llmResult, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 4096,
    temperature: 0.3,
    requestId,
  });

  // Step 3: Enrich LLM competencies with deterministic signals
  const competencies = (llmResult.competencies || []).map((comp) => {
    const detMatch = deterministicSkills.find(
      (ds) => ds.skill.toLowerCase() === comp.name.toLowerCase() ||
              (comp.synonyms || []).some((s) => s.toLowerCase() === ds.skill.toLowerCase())
    );

    return {
      ...comp,
      deterministicMatch: !!detMatch,
      mentionCount: detMatch?.mentions || 0,
    };
  });

  // Add any skills found deterministically but missed by LLM
  const llmNames = new Set(competencies.map((c) => c.name.toLowerCase()));
  const llmSynonyms = new Set(
    competencies.flatMap((c) => (c.synonyms || []).map((s) => s.toLowerCase()))
  );

  for (const ds of deterministicSkills) {
    if (!llmNames.has(ds.skill.toLowerCase()) && !llmSynonyms.has(ds.skill.toLowerCase())) {
      competencies.push({
        name: ds.skill,
        category: mapSkillCategory(ds.category),
        definition: `Proficiency in ${ds.skill}.`,
        whyItMatters: `Mentioned ${ds.mentions} time(s) in the job description.`,
        levels: {
          basic: "Familiar with core concepts",
          intermediate: "Can work independently",
          advanced: "Can architect solutions and mentor others",
        },
        evidenceExamples: ["Project work", "Certifications"],
        synonyms: [],
        estimatedWeight: Math.min(ds.mentions * 2, 8),
        confidenceNote: "Extracted from keyword matching; LLM did not explicitly flag this.",
        deterministicMatch: true,
        mentionCount: ds.mentions,
      });
    }
  }

  return {
    competencies: competencies.sort((a, b) => (b.estimatedWeight || 0) - (a.estimatedWeight || 0)),
    roleSummary: llmResult.roleSummary,
    senioritySignals: llmResult.senioritySignals,
    industryContext: llmResult.industryContext,
    usage,
  };
}

function mapSkillCategory(detCategory) {
  const map = {
    language: "technical",
    framework: "technical",
    cloud: "technical",
    devops: "technical",
    database: "technical",
    tool: "technical",
    ai: "technical",
    visualisation: "technical",
    process: "domain",
    soft: "soft_skill",
  };
  return map[detCategory] || "technical";
}

// ────────────────────────────────────────────────────────────
// CV ↔ JOB MATCH ANALYSIS
// ────────────────────────────────────────────────────────────

/**
 * Analyse the match between a CV and job competencies.
 */
export async function analyseMatch(cvStructured, competencies, jobTitle, requestId) {
  const prompt = matchAnalysisPrompt(cvStructured, competencies, jobTitle);

  const { data, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 4096,
    temperature: 0.3,
    requestId,
  });

  // Compute priority scores for gaps
  if (data.gaps) {
    data.gaps = data.gaps.map((gap) => ({
      ...gap,
      priorityScore: (gap.impact || 3) * (gap.deficiency || 3),
      priorityLabel:
        (gap.impact || 3) * (gap.deficiency || 3) > 12 ? "High" :
        (gap.impact || 3) * (gap.deficiency || 3) > 6 ? "Medium" : "Low",
    }));
    data.gaps.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  return { matchReport: data, usage };
}

