/**
 * SkillBridge SA — CV Parsing Service
 * Extracts text from PDF/DOCX files, then structures via LLM.
 *
 * Dependencies:
 *   npm install pdf-parse mammoth
 */

import { callClaude } from "../ai/claude-client";
import { cvStructuringPrompt } from "../ai/prompts";

// ────────────────────────────────────────────────────────────
// TEXT EXTRACTION
// ────────────────────────────────────────────────────────────

/**
 * Extract raw text from a CV file buffer.
 * @param {Buffer} fileBuffer - The uploaded file
 * @param {string} mimeType - 'application/pdf' or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromCV(fileBuffer, mimeType) {
  if (mimeType === "application/pdf") {
    return extractFromPDF(fileBuffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return extractFromDOCX(fileBuffer);
  }

  throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`);
}

async function extractFromPDF(buffer) {
  // Dynamic import to avoid bundling issues in edge runtime
  const pdfParse = (await import("pdf-parse")).default;

  try {
    const result = await pdfParse(buffer, {
      // Limit pages to prevent abuse
      max: 20,
    });

    const text = result.text?.trim();
    if (!text || text.length < 50) {
      throw new Error("PDF appears to contain very little readable text. It may be image-based. Please paste your CV text manually.");
    }

    return cleanExtractedText(text);
  } catch (error) {
    if (error.message.includes("very little readable text")) throw error;
    throw new Error(`Failed to parse PDF: ${error.message}. Try uploading a DOCX version instead.`);
  }
}

async function extractFromDOCX(buffer) {
  const mammoth = await import("mammoth");

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();

    if (!text || text.length < 50) {
      throw new Error("DOCX appears to contain very little text. Please check the file.");
    }

    if (result.messages?.length > 0) {
      console.warn("[CV Parser] DOCX warnings:", result.messages);
    }

    return cleanExtractedText(text);
  } catch (error) {
    if (error.message.includes("very little text")) throw error;
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Clean extracted text: normalise whitespace, remove control characters.
 */
function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, "\n")          // Normalise line endings
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // Remove control chars (keep \n \t)
    .replace(/\n{3,}/g, "\n\n")      // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, " ")      // Collapse whitespace
    .trim();
}

// ────────────────────────────────────────────────────────────
// DETERMINISTIC SKILL EXTRACTION (fast, no LLM)
// ────────────────────────────────────────────────────────────

const SKILL_PATTERNS = [
  { pattern: /\bpython\b/gi, skill: "Python", category: "language" },
  { pattern: /\bjavascript\b/gi, skill: "JavaScript", category: "language" },
  { pattern: /\btypescript\b/gi, skill: "TypeScript", category: "language" },
  { pattern: /\bjava\b/gi, skill: "Java", category: "language" },
  { pattern: /\bc\+\+\b/gi, skill: "C++", category: "language" },
  { pattern: /\bc#\b/gi, skill: "C#", category: "language" },
  { pattern: /\brust\b/gi, skill: "Rust", category: "language" },
  { pattern: /\bgo(lang)?\b/gi, skill: "Go", category: "language" },
  { pattern: /\br\b(?=\s|,|\.|\))/gi, skill: "R", category: "language" },
  { pattern: /\bsql\b/gi, skill: "SQL", category: "language" },
  { pattern: /\breact\b/gi, skill: "React", category: "framework" },
  { pattern: /\bangular\b/gi, skill: "Angular", category: "framework" },
  { pattern: /\bvue\.?js\b/gi, skill: "Vue.js", category: "framework" },
  { pattern: /\bnext\.?js\b/gi, skill: "Next.js", category: "framework" },
  { pattern: /\bnode\.?js\b/gi, skill: "Node.js", category: "framework" },
  { pattern: /\bdjango\b/gi, skill: "Django", category: "framework" },
  { pattern: /\bflask\b/gi, skill: "Flask", category: "framework" },
  { pattern: /\bspring\b/gi, skill: "Spring", category: "framework" },
  { pattern: /\b(aws|amazon web services)\b/gi, skill: "AWS", category: "cloud" },
  { pattern: /\b(azure|microsoft azure)\b/gi, skill: "Azure", category: "cloud" },
  { pattern: /\b(gcp|google cloud)\b/gi, skill: "GCP", category: "cloud" },
  { pattern: /\bdocker\b/gi, skill: "Docker", category: "devops" },
  { pattern: /\bkubernetes\b/gi, skill: "Kubernetes", category: "devops" },
  { pattern: /\b(ci\/cd|cicd)\b/gi, skill: "CI/CD", category: "devops" },
  { pattern: /\bterraform\b/gi, skill: "Terraform", category: "devops" },
  { pattern: /\bgit\b/gi, skill: "Git", category: "tool" },
  { pattern: /\bpostgres(ql)?\b/gi, skill: "PostgreSQL", category: "database" },
  { pattern: /\bmongodb\b/gi, skill: "MongoDB", category: "database" },
  { pattern: /\bmysql\b/gi, skill: "MySQL", category: "database" },
  { pattern: /\bredis\b/gi, skill: "Redis", category: "database" },
  { pattern: /\b(machine learning|ml)\b/gi, skill: "Machine Learning", category: "ai" },
  { pattern: /\b(deep learning|neural network)\b/gi, skill: "Deep Learning", category: "ai" },
  { pattern: /\b(nlp|natural language processing)\b/gi, skill: "NLP", category: "ai" },
  { pattern: /\b(tensorflow|tf)\b/gi, skill: "TensorFlow", category: "ai" },
  { pattern: /\bpytorch\b/gi, skill: "PyTorch", category: "ai" },
  { pattern: /\bscikit[- ]?learn\b/gi, skill: "Scikit-learn", category: "ai" },
  { pattern: /\bpandas\b/gi, skill: "Pandas", category: "tool" },
  { pattern: /\bnumpy\b/gi, skill: "NumPy", category: "tool" },
  { pattern: /\btableau\b/gi, skill: "Tableau", category: "visualisation" },
  { pattern: /\bpower\s?bi\b/gi, skill: "Power BI", category: "visualisation" },
  { pattern: /\b(agile|scrum|sprint|kanban)\b/gi, skill: "Agile", category: "process" },
  { pattern: /\bjira\b/gi, skill: "Jira", category: "tool" },
  { pattern: /\b(communication|stakeholder management)\b/gi, skill: "Communication", category: "soft" },
  { pattern: /\b(leadership|team lead|manager)\b/gi, skill: "Leadership", category: "soft" },
  { pattern: /\bproject management\b/gi, skill: "Project Management", category: "soft" },
];

/**
 * Fast deterministic skill extraction from text.
 * @param {string} text
 * @returns {Array<{skill: string, category: string, mentions: number}>}
 */
export function extractDeterministicSkills(text) {
  const found = new Map();

  for (const { pattern, skill, category } of SKILL_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      found.set(skill, { skill, category, mentions: matches.length });
    }
  }

  return Array.from(found.values()).sort((a, b) => b.mentions - a.mentions);
}

// ────────────────────────────────────────────────────────────
// LLM-POWERED STRUCTURING
// ────────────────────────────────────────────────────────────

/**
 * Parse CV into structured data using Claude.
 * @param {string} extractedText - Clean text from CV
 * @param {string} requestId - For logging
 * @returns {Promise<Object>} Structured CV data
 */
export async function structureCVWithLLM(extractedText, requestId) {
  // Truncate very long CVs to stay within token limits
  const truncated = extractedText.length > 15000
    ? extractedText.slice(0, 15000) + "\n\n[CV text truncated for processing]"
    : extractedText;

  const prompt = cvStructuringPrompt(truncated);

  const { data, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 4096,
    temperature: 0.2,
    requestId,
  });

  // Merge deterministic extraction with LLM output
  const deterministicSkills = extractDeterministicSkills(extractedText);
  const llmSkills = [
    ...(data.skills?.technical || []),
    ...(data.skills?.tools || []),
    ...(data.skills?.languages || []),
  ];

  // Add any skills found deterministically but missed by LLM
  const allSkillsLower = new Set(llmSkills.map((s) => s.toLowerCase()));
  for (const ds of deterministicSkills) {
    if (!allSkillsLower.has(ds.skill.toLowerCase())) {
      if (!data.skills) data.skills = {};
      if (!data.skills.other) data.skills.other = [];
      data.skills.other.push(ds.skill);
    }
  }

  return {
    structured: data,
    deterministicSkills,
    usage,
  };
}

// ────────────────────────────────────────────────────────────
// FULL PARSE PIPELINE
// ────────────────────────────────────────────────────────────

/**
 * Full CV parsing pipeline: extract → clean → structure.
 * @param {Buffer} fileBuffer
 * @param {string} mimeType
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
export async function parseCV(fileBuffer, mimeType, requestId) {
  // Step 1: Extract raw text
  const rawText = await extractTextFromCV(fileBuffer, mimeType);

  // Step 2: Quick deterministic extraction (instant)
  const quickSkills = extractDeterministicSkills(rawText);

  // Step 3: LLM structuring (async, may take 5-15s)
  const { structured, deterministicSkills, usage } = await structureCVWithLLM(rawText, requestId);

  return {
    extractedText: rawText,
    structuredData: structured,
    skills: deterministicSkills,
    usage,
    status: "parsed",
  };
}

