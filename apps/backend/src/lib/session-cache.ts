import { createHash } from "crypto";
import type { FastifyRequest } from "fastify";
import { redis } from "./redis";
import type { AuthSession, AuthUser } from "../types/auth.types";

// Must match better-auth's cookie name (see advanced.* in lib/auth.ts — no
// custom cookiePrefix/session.cookieName is set, so the default applies).
const SESSION_COOKIE_NAME = "better-auth.session_token";
const SESSION_CACHE_TTL_SECONDS = 60;

export interface CachedSession {
  user: AuthUser;
  session: AuthSession;
}

function extractCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      return part.slice(idx + 1).trim();
    }
  }
  return null;
}

/** better-auth signs the cookie as `<token>.<signature>` — only the token part is the DB-backed session id. */
function tokenOnly(cookieValue: string): string {
  return cookieValue.split(".")[0] ?? cookieValue;
}

function cacheKeyForToken(token: string): string {
  const hash = createHash("sha256").update(token).digest("hex");
  return `session:${hash}`;
}

export function getSessionTokenFromRequest(request: FastifyRequest): string | null {
  const raw = extractCookieValue(request.headers.cookie, SESSION_COOKIE_NAME);
  return raw ? tokenOnly(raw) : null;
}

// Every call below is wrapped so a Redis outage/latency spike degrades to a
// cache miss instead of breaking auth — this is a performance optimization,
// never a hard dependency for login/logout/session lookups to function.

export async function getCachedSession(token: string): Promise<CachedSession | null> {
  try {
    const raw = await redis.get(cacheKeyForToken(token));
    return raw ? (JSON.parse(raw) as CachedSession) : null;
  } catch (error) {
    console.error("[session-cache] getCachedSession failed:", error);
    return null;
  }
}

export async function setCachedSession(token: string, value: CachedSession): Promise<void> {
  try {
    await redis.set(cacheKeyForToken(token), JSON.stringify(value), "EX", SESSION_CACHE_TTL_SECONDS);
  } catch (error) {
    console.error("[session-cache] setCachedSession failed:", error);
  }
}

export async function invalidateCachedSession(token: string): Promise<void> {
  try {
    await redis.del(cacheKeyForToken(token));
  } catch (error) {
    console.error("[session-cache] invalidateCachedSession failed:", error);
  }
}
