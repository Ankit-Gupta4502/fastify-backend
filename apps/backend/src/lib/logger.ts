import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { FastifyRequest } from "fastify";

const LOG_DIR = join(process.cwd(), "logs");
const ERROR_LOG = join(LOG_DIR, "error.log");

mkdirSync(LOG_DIR, { recursive: true });

interface ErrorLogEntry {
  timestamp: string;
  level: "ERROR";
  requestId: string;
  method: string;
  url: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  body: unknown;
  userId: string | null;
  error: {
    name: string;
    message: string;
    code?: string | number;
    statusCode?: number;
    stack?: string;
  };
}

const SENSITIVE_KEYS = new Set(["password", "token", "secret", "authorization", "otp"]);

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : v;
  }
  return out;
}

function formatError(err: unknown): ErrorLogEntry["error"] {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      code: (err as { code?: string | number }).code,
      statusCode: (err as { statusCode?: number }).statusCode,
      stack: err.stack,
    };
  }
  return { name: "UnknownError", message: String(err) };
}

export function logError(req: FastifyRequest, err: unknown): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: "ERROR",
    requestId: req.id as string,
    method: req.method,
    url: req.url,
    query: (req.query as Record<string, unknown>) ?? {},
    params: (req.params as Record<string, unknown>) ?? {},
    body: sanitizeBody(req.body),
    userId: (req.user as { id?: string } | undefined)?.id ?? null,
    error: formatError(err),
  };

  try {
    appendFileSync(ERROR_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // never crash the server because logging failed
  }
}
