import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { v4 as uuid } from "uuid";

// ── Standard API Envelope ────────────────────────────────

export function apiOk(data: unknown, status = 200) {
  return NextResponse.json(
    { success: true, data, error: null, requestId: `req_${uuid().slice(0, 12)}`, timestamp: new Date().toISOString() },
    { status }
  );
}

export function apiErr(code: string, message: string, details: unknown[] = [], status = 400) {
  return NextResponse.json(
    { success: false, data: null, error: { code, message, details }, requestId: `req_${uuid().slice(0, 12)}`, timestamp: new Date().toISOString() },
    { status }
  );
}

// ── Request Validation ───────────────────────────────────

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        error: apiErr(
          "VALIDATION_ERROR",
          "Invalid request body",
          result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
        ),
      };
    }
    return { data: result.data };
  } catch {
    return { error: apiErr("PARSE_ERROR", "Invalid JSON body") };
  }
}

// ── Rate Limiter (In-memory for dev, Upstash for prod) ───

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + windowMs; }
  record.count++;
  rateLimitStore.set(key, record);
  if (record.count > max) return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  return { allowed: true, retryAfter: 0 };
}

// ── Audit Logger ─────────────────────────────────────────

export async function auditLog(
  prisma: any,
  params: { userId?: string; action: string; resourceType: string; resourceId?: string; metadata?: Record<string, unknown>; ip?: string }
) {
  try {
    await prisma.auditLog.create({ data: {
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata || {},
      ipAddress: params.ip,
    }});
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}
