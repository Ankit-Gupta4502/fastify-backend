import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { plans, user } from "../../schema/schema";
import { errorResponse, successResponse } from "../../utils";

export class PlansController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        // Public — no pricing fields exposed
        router.get(
          "/",
          {
            schema: {
              description: "List plans (feature flags only, no pricing)",
              tags: ["Plans"] as string[],
            },
          },
          this.list,
        );

        // User-only — includes priceCents for the billing page
        router.get(
          "/pricing",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER),
            ],
            schema: {
              description: "List plans with pricing (user role only)",
              tags: ["Plans"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.listWithPricing,
        );

        router.get(
          "/me",
          {
            preHandler: [
              this.authMiddleware.handle,
              requireRole(USER_ROLES.USER),
            ],
            schema: {
              description: "Get current user's active plan (user role only)",
              tags: ["Plans"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.myPlan,
        );
      },
      { prefix: "/plans" },
    );
  }

  private list = async (_req: FastifyRequest, reply: FastifyReply) => {
    // priceCents intentionally excluded — pricing lives in /plans/pricing (user only)
    const rows = await drizzle
      .select({
        id: plans.id,
        name: plans.name,
        sessionsPerWeek: plans.sessionsPerWeek,
        allowsPrivate: plans.allowsPrivate,
        allowsTimeFlexibility: plans.allowsTimeFlexibility,
        maxRoomCapacity: plans.maxRoomCapacity,
      })
      .from(plans);

    const { statusCode, payload } = successResponse({
      message: "Available plans",
      data: rows,
    });
    return reply.status(statusCode).send(payload);
  };

  private listWithPricing = async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await drizzle
      .select({
        id: plans.id,
        name: plans.name,
        priceCents: plans.priceCents,
        sessionsPerWeek: plans.sessionsPerWeek,
        allowsPrivate: plans.allowsPrivate,
        allowsTimeFlexibility: plans.allowsTimeFlexibility,
        maxRoomCapacity: plans.maxRoomCapacity,
      })
      .from(plans);

    const { statusCode, payload } = successResponse({
      message: "Plans with pricing",
      data: rows,
    });
    return reply.status(statusCode).send(payload);
  };

  private myPlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const [row] = await drizzle
      .select({
        plan: {
          id: plans.id,
          name: plans.name,
          priceCents: plans.priceCents,
          sessionsPerWeek: plans.sessionsPerWeek,
          allowsPrivate: plans.allowsPrivate,
          allowsTimeFlexibility: plans.allowsTimeFlexibility,
          maxRoomCapacity: plans.maxRoomCapacity,
        },
        sessionsUsedThisWeek: user.sessionsUsedThisWeek,
        weekResetAt: user.weekResetAt,
      })
      .from(user)
      .leftJoin(plans, eq(user.planId, plans.id))
      .where(eq(user.id, me.id));

    const { statusCode, payload } = successResponse({
      message: "Current plan",
      data: row ?? null,
    });
    return reply.status(statusCode).send(payload);
  };
}
