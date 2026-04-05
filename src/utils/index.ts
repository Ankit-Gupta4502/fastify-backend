import { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { ZodType, ZodError } from "zod";
import { randomInt } from "crypto";
import bcrypt from "bcrypt";

import { SignJWT, jwtVerify, decodeJwt } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret"); // use env in prod

export interface JwtPayload {
  id: string; // user id
  email: string;
  name: string;
}

export async function encodeJWT(
  payload: Omit<JwtPayload, "iat" | "exp">,
  expiresIn: string = "15m"
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn) // e.g. "15m", "2h", "7d"
    .sign(SECRET);
}

export async function verifyJWT<T extends object = JwtPayload>(
  token: string
): Promise<T> {
  const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
  return payload as T;
}

export function decodeJWT<T extends object = JwtPayload>(token: string): T {
  return decodeJwt(token) as T;
}

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function formatZodErrors(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = issue.message;
    }
  }
  return formatted;
}

export function validateWithZod(
  req: FastifyRequest,
  reply: FastifyReply,
  schemas: Schemas
) {
  try {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return reply.status(422).send({
          error: "Invalid body",
          details: formatZodErrors(result.error),
        });
      }
      req.body = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return reply.status(422).send({
          error: "Invalid query",
          details: formatZodErrors(result.error),
        });
      }
      req.query = result.data;
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return reply.status(422).send({
          error: "Invalid params",
          details: formatZodErrors(result.error),
        });
      }
      req.params = result.data;
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return reply.status(422).send({
        error: "Validation failed",
        details: formatZodErrors(err),
      });
    }
    throw err;
  }
}

export function generate4DigitOTP(): string {
  return randomInt(0, 10_000).toString().padStart(4, "0");
}

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function composePreHandler(
  ...handlers: ((request: FastifyRequest, reply: FastifyReply) => Promise<void | FastifyReply>)[]
): (request: FastifyRequest, reply: FastifyReply) => Promise<void | FastifyReply> {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    for (const handler of handlers) {
      const result = await handler(request, reply);
      if (result !== undefined) {
        return result;
      }
    }
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error?: string | null;
}

export interface SuccessResponseOptions<T> {
  message: string;
  data: T;
  statusCode?: number;
}

export interface ErrorResponseOptions {
  message: string;
  error?: string | null;
  statusCode?: number;
}

export function successResponse<T>({
  message,
  data,
  statusCode = 200,
}: SuccessResponseOptions<T>): { statusCode: number; payload: ApiResponse<T> } {
  return {
    statusCode,
    payload: {
      success: true,
      message,
      data,
      error: null,
    },
  };
}

export function errorResponse({
  message,
  error,
  statusCode = 400,
}: ErrorResponseOptions): { statusCode: number; payload: ApiResponse<null> } {
  return {
    statusCode,
    payload: {
      success: false,
      message,
      data: null,
      error: error || null,
    },
  };
}
