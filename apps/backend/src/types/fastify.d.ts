import type { AuthSession, AuthUser } from "./auth.types";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    session?: AuthSession;
  }
}

export {};
