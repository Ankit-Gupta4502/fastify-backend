import {
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
  HookHandlerDoneFunction,
} from "fastify";
import { JwtPayload, verifyJWT } from "../utils";

export class AuthMiddleware {
  public handle: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const token = request.headers["authorization"];
      if (!token || !token.startsWith("Bearer ")) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const tokenPayload = await verifyJWT<JwtPayload>(token.split(" ")[1]);
      request["user"] = tokenPayload;
    } catch (error:any) {
      const message =
        error?.code === "ERR_JWT_EXPIRED" || error?.name === "JWTExpired"
          ? "Token expired"
          : "Invalid token";

      return reply.status(401).send({ error: message, details: error?.message });
    }
  };
}
