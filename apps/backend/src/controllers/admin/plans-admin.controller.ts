import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  createCorporatePlan,
  createPlan,
  listAllPlans,
  listCorporatePlansAdmin,
  updateCorporatePlan,
  updatePlan,
} from "../../services/plans-admin.service";
import {
  corporatePlanIdParamsSchema,
  createCorporatePlanBodySchema,
  createPlanBodySchema,
  planIdParamsSchema,
  updateCorporatePlanBodySchema,
  updatePlanBodySchema,
} from "../../validation/plans-admin.validation.schema";

export class PlansAdminController {
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
        router.get("/plans", { preHandler }, this.listPlans);
        router.post("/plans", { preHandler }, this.createPlan);
        router.patch("/plans/:id", { preHandler }, this.updatePlan);

        router.get("/corporate-plans", { preHandler }, this.listCorporatePlans);
        router.post("/corporate-plans", { preHandler }, this.createCorporatePlan);
        router.patch("/corporate-plans/:id", { preHandler }, this.updateCorporatePlan);
      },
      { prefix: "/admin" },
    );
  }

  private listPlans = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await listAllPlans(drizzle);
    const { statusCode, payload } = successResponse({ message: "Plans retrieved", data });
    return reply.status(statusCode).send(payload);
  };

  private createPlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: createPlanBodySchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createPlanBodySchema>;
    const data = await createPlan(drizzle, body);
    const { statusCode, payload } = successResponse({
      message: "Plan created",
      data,
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };

  private updatePlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: planIdParamsSchema });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, { body: updatePlanBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof planIdParamsSchema>;
    const body = request.body as z.infer<typeof updatePlanBodySchema>;
    const data = await updatePlan(drizzle, id, body);

    if (!data) {
      const { statusCode, payload } = errorResponse({ message: "Plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({ message: "Plan updated", data });
    return reply.status(statusCode).send(payload);
  };

  private listCorporatePlans = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await listCorporatePlansAdmin(drizzle);
    const { statusCode, payload } = successResponse({ message: "Corporate plans retrieved", data });
    return reply.status(statusCode).send(payload);
  };

  private createCorporatePlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: createCorporatePlanBodySchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createCorporatePlanBodySchema>;
    const result = await createCorporatePlan(drizzle, body);

    if ("error" in result) {
      const { statusCode, payload } = errorResponse({ message: "Linked plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Corporate plan created",
      data: result.row,
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };

  private updateCorporatePlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, { params: corporatePlanIdParamsSchema });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, { body: updateCorporatePlanBodySchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof corporatePlanIdParamsSchema>;
    const body = request.body as z.infer<typeof updateCorporatePlanBodySchema>;
    const result = await updateCorporatePlan(drizzle, id, body);

    if ("error" in result) {
      const { statusCode, payload } = errorResponse({ message: "Linked plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }
    if (!result.row) {
      const { statusCode, payload } = errorResponse({ message: "Corporate plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({ message: "Corporate plan updated", data: result.row });
    return reply.status(statusCode).send(payload);
  };
}
