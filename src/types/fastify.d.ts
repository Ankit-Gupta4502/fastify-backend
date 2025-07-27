// src/types/fastify.d.ts
import type { JwtPayload } from "../utils"; 
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"; 

// Module augmentation
declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload
    token?: string;
  }
}
