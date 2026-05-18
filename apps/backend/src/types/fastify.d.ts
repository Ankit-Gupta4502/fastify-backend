import type { AuthSession, AuthUser } from "./auth.types";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    session?: AuthSession;
    /** Raw request body bytes — only populated on webhook routes */
    rawBody?: Buffer;
  }
}

export {};
