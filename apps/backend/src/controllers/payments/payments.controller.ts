import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  calcCustomPriceCents,
  PRICE_DISCOUNT_INR_PAISE,
  createOrderBodySchema,
  createCustomOrderBodySchema,
  verifyPaymentBodySchema,
} from "@yoga-app/shared";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { drizzle } from "../../db";
import { plans, userSubscriptions } from "../../schema/schema";
import {
  getRazorpay,
  getRazorpayKeyId,
  verifyPaymentSignature,
  verifySubscriptionSignature,
} from "../../services/razorpay.service";
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
              description: "Create a Razorpay order for a session-based plan (private / specialised)",
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
      },
      { prefix: "/payments" },
    );
  }

  // ── Custom (session-based, one-time) order ───────────────────────────────────

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

    const { sessionCount, planName, country: clientCountry } = request.body as z.infer<typeof createCustomOrderBodySchema>;
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
    const amount = isIndia && inrRatePerSession != null
      ? sessionCount * inrRatePerSession - PRICE_DISCOUNT_INR_PAISE
      : calcCustomPriceCents(sessionCount);
    const currency = isIndia && inrRatePerSession != null ? "INR" : "USD";

    try {
      const order = await getRazorpay().orders.create({
        amount,
        currency,
        receipt: `sub-${plan.id.slice(0, 8)}-${me.id.slice(0, 8)}`,
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
        status: "pending_payment",
        razorpayOrderId: order.id,
      });

      const { statusCode, payload } = successResponse({
        message: "Order created",
        data: {
          orderId: order.id,
          keyId: getRazorpayKeyId(),
          amount: Number(order.amount),
          currency: order.currency,
          planId: plan.id,
          planName: plan.name,
        },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      request.log.error({ err }, "razorpay custom order create failed");
      const { statusCode, payload } = errorResponse({
        message: "Could not create payment order",
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

    const amount = isIndia && plan.priceInrPaise != null ? plan.priceInrPaise : plan.priceCents;
    const currency = isIndia && plan.priceInrPaise != null ? "INR" : "USD";
    const period = plan.billingInterval === "week" ? "weekly" as const : "monthly" as const;

    try {
      // Lazily create (and cache) the Razorpay Plan for this DB plan + currency.
      // A Razorpay Plan is a reusable template; we only need one per (plan, currency) pair.
      let rpPlanId = isIndia ? plan.razorpayPlanIdInr : plan.razorpayPlanIdUsd;
      if (!rpPlanId) {
        const rpPlan = await getRazorpay().plans.create({
          item: { name: plan.name, amount, currency },
          period,
          interval: 1,
          notes: { planId: plan.id },
        });
        rpPlanId = rpPlan.id;
        await drizzle
          .update(plans)
          .set(isIndia ? { razorpayPlanIdInr: rpPlanId } : { razorpayPlanIdUsd: rpPlanId })
          .where(eq(plans.id, plan.id));
      }

      // total_count 120 = effectively unlimited (10 years monthly / ~2.3 years weekly)
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
        message: "Could not create payment order",
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

    // Signature format differs: subscriptions use paymentId|subscriptionId, orders use orderId|paymentId
    const signatureValid = body.razorpaySubscriptionId
      ? verifySubscriptionSignature({
          subscriptionId: body.razorpaySubscriptionId,
          paymentId: body.razorpayPaymentId,
          signature: body.razorpaySignature,
        })
      : verifyPaymentSignature({
          orderId: body.razorpayOrderId!,
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

    // Idempotency: already processed by webhook or a previous verify call.
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

    // Find the pending subscription by whichever ID the frontend supplied.
    const [sub] = await drizzle
      .select({
        id: userSubscriptions.id,
        userId: userSubscriptions.userId,
        status: userSubscriptions.status,
        sessionsTotal: userSubscriptions.sessionsTotal,
        billingInterval: plans.billingInterval,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(
        body.razorpaySubscriptionId
          ? eq(userSubscriptions.razorpaySubscriptionId, body.razorpaySubscriptionId)
          : eq(userSubscriptions.razorpayOrderId, body.razorpayOrderId!),
      )
      .limit(1);

    if (!sub) {
      const { statusCode, payload } = errorResponse({
        message: "Order not found — create an order before verifying",
        statusCode: 404,
        error: "ORDER_NOT_FOUND",
      });
      return reply.status(statusCode).send(payload);
    }

    if (sub.userId !== me.id) {
      const { statusCode, payload } = errorResponse({
        message: "Order does not belong to this account",
        statusCode: 403,
        error: "ORDER_USER_MISMATCH",
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
      // Session-pool plans have no calendar expiry; recurring plans expire after one billing cycle.
      // The webhook subscription.charged will update expiresAt with the authoritative value from Razorpay.
      let expiresAt: Date | null = null;
      if (sub.sessionsTotal === null) {
        const now = new Date();
        if (sub.billingInterval === "week") {
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else {
          const d = new Date(now);
          d.setMonth(d.getMonth() + 1);
          expiresAt = d;
        }
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
}
