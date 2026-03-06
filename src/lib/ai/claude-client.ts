/**
 * SkillBridge SA — Anthropic Claude API Client
 * Handles API calls, retry logic, token tracking, and JSON parsing.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Call the Anthropic Claude API with structured JSON output.
 * @param {Object} params
 * @param {string} params.system - System prompt
 * @param {string} params.userMessage - User message
 * @param {number} [params.maxTokens=4096] - Max output tokens
 * @param {number} [params.temperature=0.3] - Sampling temperature
 * @param {string} [params.requestId] - Request ID for logging
 * @returns {Promise<{data: Object, usage: Object}>}
 */
export async function callClaude({ system, userMessage, maxTokens = 4096, temperature = 0.3, requestId = null }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now();

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.text();

        // Rate limit — wait and retry
        if (response.status === 429 && attempt < MAX_RETRIES) {
          const retryAfter = parseInt(response.headers.get("retry-after") || "5", 10);
          console.warn(`[Claude] Rate limited (attempt ${attempt}). Retrying in ${retryAfter}s. RequestID: ${requestId}`);
          await sleep(retryAfter * 1000);
          continue;
        }

        // Overloaded — retry with backoff
        if (response.status === 529 && attempt < MAX_RETRIES) {
          console.warn(`[Claude] Overloaded (attempt ${attempt}). Retrying. RequestID: ${requestId}`);
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }

        throw new Error(`Claude API error ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      // Extract text content
      const textContent = result.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      // Parse JSON from response
      const parsedData = parseJsonFromResponse(textContent);

      // Usage tracking
      const usage = {
        inputTokens: result.usage?.input_tokens || 0,
        outputTokens: result.usage?.output_tokens || 0,
        totalTokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
        latencyMs: elapsed,
        model: MODEL,
        requestId,
      };

      console.log(`[Claude] Success: ${usage.totalTokens} tokens, ${elapsed}ms. RequestID: ${requestId}`);

      return { data: parsedData, usage, rawText: textContent };
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        console.warn(`[Claude] Retryable error (attempt ${attempt}): ${error.message}. RequestID: ${requestId}`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Claude API call failed after all retries");
}

/**
 * Parse JSON from Claude's text response.
 * Handles markdown code fences and leading/trailing text.
 */
function parseJsonFromResponse(text) {
  // Strip markdown code fences
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to find JSON object or array in the text
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        // Fall through
      }
    }

    console.error("[Claude] Failed to parse JSON response:", cleaned.slice(0, 200));
    throw new Error("Failed to parse structured JSON from Claude response");
  }
}

function isRetryableError(error) {
  const message = error.message || "";
  return (
    message.includes("429") ||
    message.includes("529") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("fetch failed")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Token cost estimator (approximate).
 * Claude Sonnet: ~$3/MTok input, ~$15/MTok output
 */
export function estimateCost(usage) {
  const inputCost = (usage.inputTokens / 1_000_000) * 3;
  const outputCost = (usage.outputTokens / 1_000_000) * 15;
  return {
    inputCostUSD: inputCost,
    outputCostUSD: outputCost,
    totalCostUSD: inputCost + outputCost,
  };
}
