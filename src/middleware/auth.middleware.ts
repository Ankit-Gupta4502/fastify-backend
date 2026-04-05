import {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from "fastify";
import { JwtPayload, verifyJWT, errorResponse } from "../utils";

export class AuthMiddleware {
  public handle: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const token = request.headers["authorization"];
      if (!token || !token.startsWith("Bearer ")) {
        const { statusCode, payload } = errorResponse({
          message: "Unauthorized",
          statusCode: 401,
        });
        return reply.code(statusCode).send(payload);
      }
      const tokenPayload = await verifyJWT<JwtPayload>(token.split(" ")[1]);
      request["user"] = tokenPayload;
    } catch (error: any) {
      const message =
        error?.code === "ERR_JWT_EXPIRED" || error?.name === "JWTExpired"
          ? "Token expired"
          : "Invalid token";

      const { statusCode, payload } = errorResponse({
        message,
        error: error?.message,
        statusCode: 401,
      });
      return reply.code(statusCode).send(payload);
    }
  };
}
