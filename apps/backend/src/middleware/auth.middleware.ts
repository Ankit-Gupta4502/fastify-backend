import {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { errorResponse } from "../utils";
import { getCachedSession, getSessionTokenFromRequest, setCachedSession } from "../lib/session-cache";

export class AuthMiddleware {
  public handle: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const token = getSessionTokenFromRequest(request);
      const cached = token ? await getCachedSession(token) : null;

      if (cached) {
        request.user = cached.user;
        request.session = cached.session;
        return;
      }

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

      if (token) {
        await setCachedSession(token, { user: session.user, session: session.session });
      }
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
