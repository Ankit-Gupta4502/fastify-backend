import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  listOrganizationsForAdmin,
  setOrganizationBillingApproval,
  setOrganizationCoupon,
  setOrganizationPricing,
} from "../../services/organization.service";
import {
  adminOrganizationIdParamsSchema,
  setBillingApprovalBodySchema,
  setOrganizationCouponBodySchema,
  setOrganizationPricingBodySchema,
} from "../../validation/organizations-admin.validation.schema";

export class OrganizationsAdminController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const preHandler = [this.authMiddleware.handle, requireRole(USER_ROLES.ADMIN)];

    app.register(
      async (router) => {
        router.get("/organizations", { preHandler }, this.listOrganizations);
        router.patch(
          "/organizations/:id/billing-approval",
          { preHandler },
          this.setBillingApproval,
        );
        router.patch("/organizations/:id/pricing", { preHandler }, this.setPricing);
        router.patch("/organizations/:id/coupon", { preHandler }, this.setCoupon);
      },
      { prefix: "/admin" },
    );
  }

  private listOrganizations = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await listOrganizationsForAdmin();
    const { statusCode, payload } = successResponse({
      message: "Organizations retrieved",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  private setBillingApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: adminOrganizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: setBillingApprovalBodySchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof adminOrganizationIdParamsSchema>;
    const { approved } = request.body as z.infer<typeof setBillingApprovalBodySchema>;
    const result = await setOrganizationBillingApproval(id, approved);

    if (!result.ok) {
      const { statusCode, payload } = errorResponse({
        message: "Organization not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: approved ? "Billing approved" : "Billing approval revoked",
      data: { success: true as const },
    });
    return reply.status(statusCode).send(payload);
  };

  private setPricing = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: adminOrganizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: setOrganizationPricingBodySchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof adminOrganizationIdParamsSchema>;
    const body = request.body as z.infer<typeof setOrganizationPricingBodySchema>;
    const result = await setOrganizationPricing(id, {
      pricePerSeatCents: body.pricePerSeatCents ?? null,
      pricePerSeatInrPaise: body.pricePerSeatInrPaise ?? null,
    });

    if (!result.ok) {
      const { statusCode, payload } = errorResponse({
        message: "Organization not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Pricing updated",
      data: { success: true as const },
    });
    return reply.status(statusCode).send(payload);
  };

  private setCoupon = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: adminOrganizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: setOrganizationCouponBodySchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof adminOrganizationIdParamsSchema>;
    const body = request.body as z.infer<typeof setOrganizationCouponBodySchema>;
    const result = await setOrganizationCoupon(id, body);

    if (!result.ok) {
      const { statusCode, payload } = errorResponse({
        message: "Organization not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Coupon updated",
      data: { code: result.code },
    });
    return reply.status(statusCode).send(payload);
  };
}
