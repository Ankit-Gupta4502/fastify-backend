import {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { errorResponse } from "../utils";

export class AuthMiddleware {
  public handle: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        const { statusCode, payload } = errorResponse({
          message: "Unauthorized",
          statusCode: 401,
        });
        return reply.code(statusCode).send(payload);
      }

      request.user = session.user;
      request.session = session.session;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid session";

      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        error: message,
        statusCode: 401,
      });
      return reply.code(statusCode).send(payload);
    }
  };
}
