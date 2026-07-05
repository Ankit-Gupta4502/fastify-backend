import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { plans, user, userSubscriptions } from "../../schema/schema";
import { detectCountry, errorResponse, successResponse } from "../../utils";

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

  private listWithPricing = async (req: FastifyRequest, reply: FastifyReply) => {
    const { country: queryCountry } = req.query as { country?: string };
    const country = detectCountry(req, queryCountry);

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
      data: { plans: rows, country },
    });
    return reply.status(statusCode).send(payload);
  };

  private myPlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    // Active subscriptions = anything the user actually paid for, gated purely
    // by expiresAt — "pending_payment" is the only status excluded outright
    // (payment never completed, so there's nothing to show).
    //   - "expired": session-pool plans (private / prenatal_postnatal /
    //     therapeutic_yoga) auto-flip here the moment sessionsUsed reaches
    //     sessionsTotal (see session-pool.service.ts). That flip is reversible
    //     (a refunded session un-expires it) and unrelated to the billing
    //     period, so the plan should keep showing (0 remaining) until its
    //     expiresAt actually passes — it should NOT be re-bookable though,
    //     which is enforced separately by getActiveSubscriptions/booking
    //     locks requiring status = "active", so leave that logic alone.
    //   - "cancelled": user cancelled a recurring subscription (Razorpay
    //     cancel_at_cycle_end — access continues until the paid period ends).
    //     Cancelling flips status immediately, but expiresAt is untouched, so
    //     it should keep showing until that period actually ends, not vanish
    //     the moment they cancel.
    // A user can hold more than one at once (e.g. a group plan plus a private-session add-on).
    const rows = await drizzle
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
          inArray(userSubscriptions.status, ["active", "expired", "cancelled"]),
          or(
            isNull(userSubscriptions.expiresAt),
            gt(userSubscriptions.expiresAt, new Date()),
          ),
        ),
      )
      .orderBy(desc(userSubscriptions.purchasedAt));

    const { statusCode, payload } = successResponse({
      message: "Current plans",
      data: rows,
    });
    return reply.status(statusCode).send(payload);
  };
}
