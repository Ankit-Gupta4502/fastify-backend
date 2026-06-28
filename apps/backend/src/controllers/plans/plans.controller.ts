import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { plans, user, userSubscriptions } from "../../schema/schema";
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

        // Authenticated — includes priceCents for the billing page
        router.get(
          "/pricing",
          {
            preHandler: [],
            schema: {
              description: "List plans with pricing",
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
              description: "Get current user's active subscription and plan",
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

  // Exclude session-based plan templates from the public list — they are only
  // available via the custom-order flow.
  private readonly sessionBasedPlanNames = ["private", "prenatal_postnatal", "therapeutic_yoga"];

  private list = async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await drizzle
      .select({
        id: plans.id,
        name: plans.name,
        billingInterval: plans.billingInterval,
        sessionsPerWeek: plans.sessionsPerWeek,
        sessionsPerMonth: plans.sessionsPerMonth,
        allowsPrivate: plans.allowsPrivate,
        allowsTimeFlexibility: plans.allowsTimeFlexibility,
        maxRoomCapacity: plans.maxRoomCapacity,
        category: plans.category,
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
        priceInrPaise: plans.priceInrPaise,
        pricePerSessionCents: plans.pricePerSessionCents,
        pricePerSessionInrPaise: plans.pricePerSessionInrPaise,
        billingInterval: plans.billingInterval,
        sessionsPerWeek: plans.sessionsPerWeek,
        sessionsPerMonth: plans.sessionsPerMonth,
        allowsPrivate: plans.allowsPrivate,
        allowsTimeFlexibility: plans.allowsTimeFlexibility,
        maxRoomCapacity: plans.maxRoomCapacity,
        category: plans.category,
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
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    // Active subscription = status is 'active' AND either:
    //   - recurring plan (sessionsTotal IS NULL), or
    //   - session-based plan with remaining sessions (sessionsUsed < sessionsTotal)
    const [row] = await drizzle
      .select({
        subscriptionId: userSubscriptions.id,
        sessionsTotal: userSubscriptions.sessionsTotal,
        sessionsUsed: userSubscriptions.sessionsUsed,
        pricePaidCents: userSubscriptions.pricePaidCents,
        purchasedAt: userSubscriptions.purchasedAt,
        expiresAt: userSubscriptions.expiresAt,
        plan: {
          id: plans.id,
          name: plans.name,
          billingInterval: plans.billingInterval,
          sessionsPerWeek: plans.sessionsPerWeek,
          sessionsPerMonth: plans.sessionsPerMonth,
          allowsPrivate: plans.allowsPrivate,
          allowsTimeFlexibility: plans.allowsTimeFlexibility,
          maxRoomCapacity: plans.maxRoomCapacity,
          category: plans.category,
        },
        // Weekly quota (for recurring group_live plans)
        sessionsUsedThisWeek: user.sessionsUsedThisWeek,
        weekResetAt: user.weekResetAt,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .innerJoin(user, eq(userSubscriptions.userId, user.id))
      .where(
        and(
          eq(userSubscriptions.userId, me.id),
          eq(userSubscriptions.status, "active"),
          or(
            isNull(userSubscriptions.sessionsTotal),
            lt(userSubscriptions.sessionsUsed, userSubscriptions.sessionsTotal),
          ),
        ),
      )
      .orderBy(desc(userSubscriptions.purchasedAt))
      .limit(1);

    const { statusCode, payload } = successResponse({
      message: "Current plan",
      data: row ?? null,
    });
    return reply.status(statusCode).send(payload);
  };
}
