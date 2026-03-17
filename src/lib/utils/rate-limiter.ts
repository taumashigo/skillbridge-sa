/**
 * SkillBridge SA — Enhanced Rate Limiting & Cost Controls
 * In-memory rate limiting with token budget awareness.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  tokens: number;
}

const limits = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limits) {
      if (now > entry.resetAt) limits.delete(key);
    }
  }, 300000);
}

/**
 * Rate limit check with token budget.
 * @param key - Unique key (e.g. "cv-parse:userId")
 * @param maxRequests - Max requests per window
 * @param windowMs - Time window in milliseconds
 * @param maxTokens - Optional token budget per window
 * @returns { allowed, remaining, retryAfter, tokenBudgetRemaining }
 */
export function enhancedRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  maxTokens?: number
): { allowed: boolean; remaining: number; retryAfter: number; tokenBudgetRemaining: number } {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs, tokens: 0 });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0, tokenBudgetRemaining: maxTokens || Infinity };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter, tokenBudgetRemaining: (maxTokens || Infinity) - entry.tokens };
  }

  if (maxTokens && entry.tokens >= maxTokens) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: maxRequests - entry.count, retryAfter, tokenBudgetRemaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfter: 0, tokenBudgetRemaining: (maxTokens || Infinity) - entry.tokens };
}

/**
 * Record token usage against a rate limit key.
 */
export function recordTokenUsage(key: string, tokens: number) {
  const entry = limits.get(key);
  if (entry) entry.tokens += tokens;
}

/**
 * API endpoint rate limits configuration.
 */
export const API_LIMITS = {
  "cv-upload": { maxRequests: 5, windowMs: 60000 },
  "cv-parse": { maxRequests: 3, windowMs: 60000, maxTokens: 50000 },
  "job-ingest": { maxRequests: 5, windowMs: 60000, maxTokens: 100000 },
  "assessment": { maxRequests: 3, windowMs: 60000, maxTokens: 50000 },
  "coach": { maxRequests: 20, windowMs: 60000, maxTokens: 30000 },
  "learning": { maxRequests: 3, windowMs: 300000, maxTokens: 100000 },
  "podcast": { maxRequests: 2, windowMs: 300000, maxTokens: 50000 },
  "cv-optimise": { maxRequests: 3, windowMs: 60000, maxTokens: 100000 },
  "cover-letter": { maxRequests: 5, windowMs: 60000, maxTokens: 30000 },
  "linkedin": { maxRequests: 3, windowMs: 60000, maxTokens: 40000 },
  "interview": { maxRequests: 3, windowMs: 60000, maxTokens: 50000 },
  "salary": { maxRequests: 5, windowMs: 60000, maxTokens: 40000 },
} as const;

/**
 * Daily cost estimator.
 * Claude Sonnet: ~$3/MTok input, ~$15/MTok output
 */
export function estimateDailyCost(totalInputTokens: number, totalOutputTokens: number) {
  const inputCost = (totalInputTokens / 1_000_000) * 3;
  const outputCost = (totalOutputTokens / 1_000_000) * 15;
  return {
    inputCostUSD: Math.round(inputCost * 100) / 100,
    outputCostUSD: Math.round(outputCost * 100) / 100,
    totalCostUSD: Math.round((inputCost + outputCost) * 100) / 100,
  };
}
