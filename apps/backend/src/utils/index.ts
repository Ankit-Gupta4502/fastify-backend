import { FastifyReply, FastifyRequest } from "fastify";
import { ZodType, ZodError } from "zod";
import { type ApiResponse } from "@yoga-app/shared";

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
