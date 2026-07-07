import Redis from "ioredis";
import fp from "fastify-plugin";
import { getRedisUrl } from "../config/redis";

// A dedicated client (rather than lazyConnect) so connection errors surface
// at boot via the "error" listener below instead of on the first cache call.
export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 1,
  retryStrategy: (attempt) => Math.min(attempt * 200, 5000),
  reconnectOnError: () => true,
});

redis.on("connect", () => {
  console.log("[redis] connected");
});

redis.on("error", (err) => {
  // Redis is a best-effort cache for session lookups — log and keep serving
  // requests uncached rather than let a Redis outage take down the API.
  console.error("[redis] connection error:", err.message);
});

export default fp(async (app) => {
  app.addHook("onClose", async () => {
    await redis.quit();
  });
});
