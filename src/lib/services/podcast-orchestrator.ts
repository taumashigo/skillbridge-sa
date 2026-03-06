/**
 * SkillBridge SA — Podcast Orchestration Service
 * Multi-agent panel discussion with redirect support.
 */

import { callClaude } from "../ai/claude-client";
import { podcastOutlinePrompt, podcastRedirectPrompt } from "../ai/prompts";

// ────────────────────────────────────────────────────────────
// SPEAKER DEFINITIONS
// ────────────────────────────────────────────────────────────

export const SPEAKERS = {
  moderator: {
    id: "moderator",
    name: "Thandiwe",
    role: "Moderator",
    emoji: "🎙️",
    description: "Keeps discussion on track, summarises, timeboxes, ensures balanced participation.",
  },
  expert: {
    id: "expert",
    name: "Dr Aisha",
    role: "Domain Expert",
    emoji: "🎓",
    description: "Deep technical explanations with practical, real-world examples.",
  },
  hiring: {
    id: "hiring",
    name: "Sipho",
    role: "Hiring Manager",
    emoji: "💼",
    description: "What hiring teams look for, interview tips, common pitfalls, industry expectations.",
  },
  user: {
    id: "user",
    name: "You",
    role: "User Avatar",
    emoji: "👤",
    description: "Asks questions at the candidate's level, reflects their actual gaps and interests.",
  },
};

// ────────────────────────────────────────────────────────────
// EPISODE CREATION
// ────────────────────────────────────────────────────────────

/**
 * Create a new podcast episode outline + initial turns.
 * @param {Object} params
 * @param {Array} params.competencies - Job competencies
 * @param {Array} params.gaps - Prioritised skill gaps
 * @param {Object} params.userProfile - Candidate profile
 * @param {string} params.jobTitle
 * @param {string} params.requestId
 * @returns {Promise<Object>}
 */
export async function createEpisode({ competencies, gaps, userProfile, jobTitle, requestId }) {
  const prompt = podcastOutlinePrompt(competencies, gaps, userProfile, jobTitle);

  const { data, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 4096,
    temperature: 0.7, // Higher temperature for natural conversation
    requestId,
  });

  // Validate and number turns
  const turns = (data.turns || []).map((turn, index) => ({
    turnNumber: index + 1,
    speaker: turn.speaker,
    name: turn.name,
    content: turn.content,
    chapter: turn.chapter,
    isRedirect: false,
  }));

  return {
    title: data.title || `${jobTitle} — Skills Deep Dive`,
    outline: data.outline,
    turns,
    usage,
  };
}

// ────────────────────────────────────────────────────────────
// REDIRECT (User steers the discussion)
// ────────────────────────────────────────────────────────────

/**
 * Handle a user redirect: generate next 3-5 adapted turns.
 * @param {Object} params
 * @param {string} params.redirectText - What the user wants to discuss
 * @param {Array} params.recentTurns - Last few turns for context
 * @param {Array} params.competencies
 * @param {Object} params.userProfile
 * @param {number} params.currentTurnNumber - Last turn number
 * @param {string} params.requestId
 * @returns {Promise<Object>}
 */
export async function handleRedirect({ redirectText, recentTurns, competencies, userProfile, currentTurnNumber, requestId }) {
  const prompt = podcastRedirectPrompt(redirectText, recentTurns, competencies, userProfile);

  const { data, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 2048,
    temperature: 0.7,
    requestId,
  });

  // Build redirect response: user's redirect message + panel responses
  const redirectTurn = {
    turnNumber: currentTurnNumber + 1,
    speaker: "User Avatar",
    name: "You",
    content: redirectText,
    chapter: "Your Question",
    isRedirect: true,
  };

  const responseTurns = (data.turns || []).map((turn, index) => ({
    turnNumber: currentTurnNumber + 2 + index,
    speaker: turn.speaker,
    name: turn.name,
    content: turn.content,
    chapter: turn.chapter || "Response to Your Question",
    isRedirect: false,
  }));

  return {
    turns: [redirectTurn, ...responseTurns],
    usage,
  };
}

// ────────────────────────────────────────────────────────────
// CONTINUE EPISODE (Generate next batch of turns)
// ────────────────────────────────────────────────────────────

/**
 * Continue an episode with the next chapter.
 */
export async function continueEpisode({ outline, existingTurns, competencies, userProfile, jobTitle, currentTurnNumber, requestId }) {
  // Determine which chapters have been covered
  const coveredChapters = new Set(existingTurns.map((t) => t.chapter));
  const nextChapter = (outline?.chapters || []).find((ch) => !coveredChapters.has(ch.title));

  if (!nextChapter) {
    // All chapters covered — generate a wrap-up
    return generateWrapUp(existingTurns, competencies, jobTitle, currentTurnNumber, requestId);
  }

  const prompt = {
    system: `You are continuing a podcast panel discussion. Generate the next 4-6 turns for the chapter "${nextChapter.title}" focusing on "${nextChapter.focus}". Speakers: Moderator (Thandiwe), Domain Expert (Dr Aisha), Hiring Manager (Sipho), User Avatar (You). Natural, conversational dialogue. UK English. Valid JSON only.`,
    userMessage: `Continue the episode.

Previous context (last 3 turns):
${JSON.stringify(existingTurns.slice(-3), null, 2)}

Next chapter: ${nextChapter.title}
Focus: ${nextChapter.focus}

Return JSON:
{
  "turns": [
    { "speaker": "string", "name": "string", "content": "string", "chapter": "${nextChapter.title}" }
  ]
}`
  };

  const { data, usage } = await callClaude({
    system: prompt.system,
    userMessage: prompt.userMessage,
    maxTokens: 2048,
    temperature: 0.7,
    requestId,
  });

  const turns = (data.turns || []).map((turn, index) => ({
    turnNumber: currentTurnNumber + 1 + index,
    ...turn,
    isRedirect: false,
  }));

  return { turns, usage };
}

async function generateWrapUp(existingTurns, competencies, jobTitle, currentTurnNumber, requestId) {
  const { data, usage } = await callClaude({
    system: "Generate a 3-turn wrap-up for a podcast panel discussion. Moderator summarises key takeaways, Expert gives a final tip, Hiring Manager gives encouragement. UK English. Valid JSON only.",
    userMessage: `Wrap up the "${jobTitle}" episode. Key competencies discussed: ${competencies.slice(0, 5).map((c) => c.name).join(", ")}. Return JSON: { "turns": [{ "speaker": "string", "name": "string", "content": "string", "chapter": "Wrap-Up" }] }`,
    maxTokens: 1024,
    temperature: 0.7,
    requestId,
  });

  return {
    turns: (data.turns || []).map((turn, index) => ({
      turnNumber: currentTurnNumber + 1 + index,
      ...turn,
      isRedirect: false,
    })),
    usage,
    isComplete: true,
  };
}

// ────────────────────────────────────────────────────────────
// TRANSCRIPT EXPORT
// ────────────────────────────────────────────────────────────

/**
 * Export turns as a formatted transcript (Markdown).
 */
export function exportTranscript(episode, turns) {
  const lines = [
    `# ${episode.title}`,
    `_SkillBridge SA Panel Podcast_\n`,
    `**Speakers:** Thandiwe (Moderator), Dr Aisha (Domain Expert), Sipho (Hiring Manager), You (Candidate)\n`,
    "---\n",
  ];

  let currentChapter = null;

  for (const turn of turns) {
    if (turn.chapter && turn.chapter !== currentChapter) {
      currentChapter = turn.chapter;
      lines.push(`\n## ${currentChapter}\n`);
    }

    const speaker = Object.values(SPEAKERS).find((s) => s.role === turn.speaker || s.name === turn.name);
    const prefix = speaker ? `**${speaker.emoji} ${speaker.name} (${speaker.role}):**` : `**${turn.name}:**`;
    const marker = turn.isRedirect ? " ↩️ _[Redirect]_" : "";

    lines.push(`${prefix}${marker} ${turn.content}\n`);
  }

  lines.push("\n---\n_Generated by SkillBridge SA_");

  return lines.join("\n");
}
