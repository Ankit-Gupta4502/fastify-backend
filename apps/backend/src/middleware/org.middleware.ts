import { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { isOrganizationAdmin } from "../services/organization.service";
import { errorResponse } from "../utils";

// Org-admin equivalent of requireRole(USER_ROLES.ADMIN) — admin-ness here
// lives in organization_members.role, not the platform user.role, so it
// can't reuse that middleware.
export function requireOrgAdmin(paramName = "id"): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;
    const organizationId = (request.params as Record<string, string>)[
      paramName
    ];

    const isAdmin =
      !!userId &&
      !!organizationId &&
      (await isOrganizationAdmin(organizationId, userId));

    if (!isAdmin) {
      const { statusCode, payload } = errorResponse({
        message: "Forbidden",
        statusCode: 403,
      });
      return reply.code(statusCode).send(payload);
    }
  };
}
