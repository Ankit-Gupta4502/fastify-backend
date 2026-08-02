import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  PRICE_DISCOUNT_CENTS,
  PRICE_DISCOUNT_INR_PAISE,
  createOrderBodySchema,
  createCustomOrderBodySchema,
  verifyPaymentBodySchema,
  cancelSubscriptionBodySchema,
} from "@yoga-app/shared";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { drizzle } from "../../db";
import { plans, userSubscriptions } from "../../schema/schema";
import {
  getOrCreateSessionRazorpayPlan,
  getOrCreateStandardRazorpayPlan,
} from "../../services/razorpay-plans.service";
import {
  getRazorpay,
  getRazorpayKeyId,
  verifySubscriptionSignature,
} from "../../services/razorpay.service";
import { rewardReferrerIfEligible } from "../../services/referral.service";
import {
  applyCouponDiscount,
  validateCouponForUser,
} from "../../services/coupon.service";
import { detectCountry, errorResponse, successResponse, validateWithZod } from "../../utils";

export class PaymentsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.post(
          "/orders",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Create a Razorpay subscription for a recurring plan",
              tags: ["Payments"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.createOrder,
        );

        router.post(
          "/custom-order",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Create a Razorpay subscription for a session-based plan (private / specialised)",
              tags: ["Payments"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.createCustomOrder,
        );

        router.post(
          "/verify",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Verify Razorpay payment and activate subscription",
              tags: ["Payments"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.verify,
        );

        router.post(
          "/cancel",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Cancel one of the user's active subscriptions at period end",
              tags: ["Payments"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.cancel,
        );
      },
      { prefix: "/payments" },
    );
  }

  // ── Custom (session-based, recurring) subscription ───────────────────────────

  private createCustomOrder = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: createCustomOrderBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { sessionCount, planName, country: clientCountry, couponCode } = request.body as z.infer<typeof createCustomOrderBodySchema>;
    const country = detectCountry(request, clientCountry);
    const isIndia = country === "IN";

    const [plan] = await drizzle
      .select()
      .from(plans)
      .where(eq(plans.name, planName))
      .limit(1);

    if (!plan) {
      const { statusCode, payload } = errorResponse({ message: "Plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const inrRatePerSession = plan.pricePerSessionInrPaise;
    const usdRatePerSession = plan.pricePerSessionCents;
    const useInrPricing = isIndia && inrRatePerSession != null;
    if (!useInrPricing && usdRatePerSession == null) {
      const { statusCode, payload } = errorResponse({ message: "Plan pricing not configured", statusCode: 500 });
      return reply.status(statusCode).send(payload);
    }
    const baseAmount = useInrPricing
      ? sessionCount * (inrRatePerSession as number)
      : sessionCount * (usdRatePerSession as number);

    let amount: number;
    if (couponCode) {
      const validation = await validateCouponForUser(couponCode, me.id);
      if (!validation.valid) {
        const { statusCode, payload } = errorResponse({
          message: `Coupon is ${validation.reason.replace(/_/g, " ")}`,
          statusCode: 400,
          error: "INVALID_COUPON",
        });
        return reply.status(statusCode).send(payload);
      }
      amount = applyCouponDiscount(baseAmount, validation.coupon);
    } else {
      amount = useInrPricing
        ? baseAmount - PRICE_DISCOUNT_INR_PAISE
        : baseAmount - PRICE_DISCOUNT_CENTS;
    }
    const currency = useInrPricing ? "INR" : "USD";
    const period = plan.billingInterval === "week" ? "weekly" as const : "monthly" as const;

    // Idempotency: return an existing pending subscription rather than creating a duplicate
    const [existingPending] = await drizzle
      .select({ razorpaySubscriptionId: userSubscriptions.razorpaySubscriptionId })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, me.id),
          eq(userSubscriptions.planId, plan.id),
          eq(userSubscriptions.status, "pending_payment"),
          eq(userSubscriptions.sessionsTotal, sessionCount),
        ),
      )
      .limit(1);

    if (existingPending?.razorpaySubscriptionId) {
      const { statusCode, payload } = successResponse({
        message: "Subscription created",
        data: {
          subscriptionId: existingPending.razorpaySubscriptionId,
          keyId: getRazorpayKeyId(),
          planId: plan.id,
          planName: plan.name,
        },
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      const rpPlanId = await getOrCreateSessionRazorpayPlan({
        planId: plan.id,
        planName: plan.name,
        sessionCount,
        amount,
        currency,
        period,
      });

      const rpSub = await getRazorpay().subscriptions.create({
        plan_id: rpPlanId,
        total_count: 120,
        customer_notify: 1,
        notes: {
          userId: me.id,
          planId: plan.id,
          planName: plan.name,
          sessionCount: String(sessionCount),
        },
      });

      await drizzle.insert(userSubscriptions).values({
        userId: me.id,
        planId: plan.id,
        sessionsTotal: sessionCount,
        sessionsUsed: 0,
        pricePaidCents: amount,
        currency,
        status: "pending_payment",
        razorpaySubscriptionId: rpSub.id,
      });

      const { statusCode, payload } = successResponse({
        message: "Subscription created",
        data: {
          subscriptionId: rpSub.id,
          keyId: getRazorpayKeyId(),
          planId: plan.id,
          planName: plan.name,
        },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      request.log.error({ err }, "razorpay custom subscription create failed");
      const { statusCode, payload } = errorResponse({
        message: "Could not create payment subscription",
        statusCode: 502,
      });
      return reply.status(statusCode).send(payload);
    }
  };

  // ── Standard (recurring) order — uses Razorpay Subscriptions API ─────────────

  private createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: createOrderBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof createOrderBodySchema>;
    const country = detectCountry(request, body.country);
    const isIndia = country === "IN";

    const [plan] = await drizzle
      .select()
      .from(plans)
      .where(eq(plans.id, body.planId))
      .limit(1);

    if (!plan) {
      const { statusCode, payload } = errorResponse({ message: "Plan not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const baseAmount = isIndia && plan.priceInrPaise != null ? plan.priceInrPaise : plan.priceCents;
    const currency = isIndia && plan.priceInrPaise != null ? "INR" : "USD";
    const period = plan.billingInterval === "week" ? "weekly" as const : "monthly" as const;

    if (baseAmount == null) {
      const { statusCode, payload } = errorResponse({ message: "Plan price not configured", statusCode: 400 });
      return reply.status(statusCode).send(payload);
    }

    let amount = baseAmount;
    if (body.couponCode) {
      const validation = await validateCouponForUser(body.couponCode, me.id);
      if (!validation.valid) {
        const { statusCode, payload } = errorResponse({
          message: `Coupon is ${validation.reason.replace(/_/g, " ")}`,
          statusCode: 400,
          error: "INVALID_COUPON",
        });
        return reply.status(statusCode).send(payload);
      }
      amount = applyCouponDiscount(baseAmount, validation.coupon);
    }

    // Idempotency: return an existing pending subscription rather than creating a duplicate
    const [existingPending] = await drizzle
      .select({ razorpaySubscriptionId: userSubscriptions.razorpaySubscriptionId })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, me.id),
          eq(userSubscriptions.planId, plan.id),
          eq(userSubscriptions.status, "pending_payment"),
          isNull(userSubscriptions.sessionsTotal),
        ),
      )
      .limit(1);

    if (existingPending?.razorpaySubscriptionId) {
      const { statusCode, payload } = successResponse({
        message: "Subscription created",
        data: {
          subscriptionId: existingPending.razorpaySubscriptionId,
          keyId: getRazorpayKeyId(),
          planId: plan.id,
          planName: plan.name,
        },
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      const rpPlanId = await getOrCreateStandardRazorpayPlan({
        planId: plan.id,
        planName: plan.name,
        amount,
        currency,
        period,
        isIndia,
      });

      const rpSub = await getRazorpay().subscriptions.create({
        plan_id: rpPlanId,
        total_count: 120,
        customer_notify: 1,
        notes: { userId: me.id, planId: plan.id, planName: plan.name },
      });

      await drizzle.insert(userSubscriptions).values({
        userId: me.id,
        planId: plan.id,
        sessionsTotal: null,
        sessionsUsed: 0,
        pricePaidCents: amount,
        currency,
        status: "pending_payment",
        razorpaySubscriptionId: rpSub.id,
      });

      const { statusCode, payload } = successResponse({
        message: "Subscription created",
        data: {
          subscriptionId: rpSub.id,
          keyId: getRazorpayKeyId(),
          planId: plan.id,
          planName: plan.name,
        },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      request.log.error({ err }, "razorpay subscription create failed");
      const { statusCode, payload } = errorResponse({
        message: "Could not create payment subscription",
        statusCode: 502,
      });
      return reply.status(statusCode).send(payload);
    }
  };

  // ── Verify & activate ────────────────────────────────────────────────────────

  private verify = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: verifyPaymentBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof verifyPaymentBodySchema>;

    if (!body.razorpaySubscriptionId) {
      const { statusCode, payload } = errorResponse({
        message: "razorpaySubscriptionId is required",
        statusCode: 400,
        error: "SUBSCRIPTION_ID_REQUIRED",
      });
      return reply.status(statusCode).send(payload);
    }

    const signatureValid = verifySubscriptionSignature({
      subscriptionId: body.razorpaySubscriptionId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });

    if (!signatureValid) {
      const { statusCode, payload } = errorResponse({
        message: "Invalid payment signature",
        statusCode: 400,
        error: "INVALID_SIGNATURE",
      });
      return reply.status(statusCode).send(payload);
    }

    const [byPaymentId] = await drizzle
      .select({ id: userSubscriptions.id })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.razorpayPaymentId, body.razorpayPaymentId))
      .limit(1);

    if (byPaymentId) {
      const { statusCode, payload } = successResponse({
        message: "Payment already verified",
        data: { success: true as const, subscriptionId: byPaymentId.id },
      });
      return reply.status(statusCode).send(payload);
    }

    const [sub] = await drizzle
      .select({
        id: userSubscriptions.id,
        userId: userSubscriptions.userId,
        status: userSubscriptions.status,
        billingInterval: plans.billingInterval,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(eq(userSubscriptions.razorpaySubscriptionId, body.razorpaySubscriptionId))
      .limit(1);

    if (!sub) {
      const { statusCode, payload } = errorResponse({
        message: "Subscription not found — create a subscription before verifying",
        statusCode: 404,
        error: "SUBSCRIPTION_NOT_FOUND",
      });
      return reply.status(statusCode).send(payload);
    }

    if (sub.userId !== me.id) {
      const { statusCode, payload } = errorResponse({
        message: "Subscription does not belong to this account",
        statusCode: 403,
        error: "SUBSCRIPTION_USER_MISMATCH",
      });
      return reply.status(statusCode).send(payload);
    }

    if (sub.status !== "pending_payment") {
      const { statusCode, payload } = successResponse({
        message: "Payment already processed",
        data: { success: true as const, subscriptionId: sub.id },
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      const now = new Date();
      let expiresAt: Date;
      if (sub.billingInterval === "week") {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else {
        expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await drizzle
        .update(userSubscriptions)
        .set({ status: "active", razorpayPaymentId: body.razorpayPaymentId, expiresAt })
        .where(
          and(
            eq(userSubscriptions.id, sub.id),
            eq(userSubscriptions.status, "pending_payment"),
          ),
        );

      await rewardReferrerIfEligible(sub.userId, request.log);
    } catch (err) {
      request.log.error({ err }, "failed to activate subscription after verified payment");
      const { statusCode, payload } = errorResponse({
        message: "Payment verified but subscription activation failed. Please contact support.",
        statusCode: 500,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Payment verified",
      data: { success: true as const, subscriptionId: sub.id },
    });
    return reply.status(statusCode).send(payload);
  };

  // ── Cancel active subscription ───────────────────────────────────────────────

  private cancel = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: cancelSubscriptionBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { subscriptionId } = request.body as z.infer<typeof cancelSubscriptionBodySchema>;

    const [sub] = await drizzle
      .select({
        id: userSubscriptions.id,
        razorpaySubscriptionId: userSubscriptions.razorpaySubscriptionId,
        status: userSubscriptions.status,
      })
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.id, subscriptionId),
          eq(userSubscriptions.userId, me.id),
          eq(userSubscriptions.status, "active"),
        ),
      )
      .limit(1);

    if (!sub) {
      const { statusCode, payload } = errorResponse({
        message: "No active subscription found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      if (sub.razorpaySubscriptionId) {
        // cancel_at_cycle_end: 1 — user keeps access until the current period ends
        await getRazorpay().subscriptions.cancel(sub.razorpaySubscriptionId,false);
      }

      await drizzle
        .update(userSubscriptions)
        .set({ status: "cancelled" })
        .where(eq(userSubscriptions.id, sub.id));
    } catch (err) {
      request.log.error({ err }, "failed to cancel subscription");
      const { statusCode, payload } = errorResponse({
        message: "Could not cancel subscription. Please try again or contact support.",
        statusCode: 502,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Subscription cancelled",
      data: { success: true as const },
    });
    return reply.status(statusCode).send(payload);
  };
}
