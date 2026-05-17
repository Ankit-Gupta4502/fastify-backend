import type { FastifyReply } from "fastify";

export function applyAuthResponseHeaders(
  reply: FastifyReply,
  headers: Headers,
): void {
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    reply.header(key, value);
  });

  if (typeof headers.getSetCookie === "function") {
    for (const cookie of headers.getSetCookie()) {
      reply.header("set-cookie", cookie);
    }
    return;
  }

  const setCookie = headers.get("set-cookie");
  if (setCookie) {
    reply.header("set-cookie", setCookie);
  }
}
