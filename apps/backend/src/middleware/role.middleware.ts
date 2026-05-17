import { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { UserRole, isUserRole } from "../constants/roles";
import { errorResponse } from "../utils";

export function requireRole(...allowedRoles: UserRole[]): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const role = request.user?.role;

    if (!role || !isUserRole(role) || !allowedRoles.includes(role)) {
      const { statusCode, payload } = errorResponse({
        message: "Forbidden",
        statusCode: 403,
      });
      return reply.code(statusCode).send(payload);
    }
  };
}
