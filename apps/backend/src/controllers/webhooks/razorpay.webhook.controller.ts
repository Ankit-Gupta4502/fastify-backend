import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { plans, userSubscriptions } from "../../schema/schema";
import { verifyWebhookSignature } from "../../services/razorpay.service";
import { successResponse } from "../../utils";

interface RazorpayPaymentEntity {
  id: string;
  order_id: string | null;
  subscription_id?: string | null;
  status: string;
  notes?: Record<string, string>;
}

interface RazorpayOrderEntity {
  id: string;
  status: string;
  notes?: Record<string, string>;
}

interface RazorpaySubscriptionEntity {
  id: string;
  status: string;
  paid_count?: number;
  current_start?: number | null;
  current_end?: number | null;
}

interface RazorpayWebhookEvent {
  entity: string;
  event: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
    order?: { entity?: RazorpayOrderEntity };
    subscription?: { entity?: RazorpaySubscriptionEntity };
  };
}

export class RazorpayWebhookController {
  constructor(private readonly app: FastifyInstance) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        // Capture raw bytes for HMAC verification before JSON parsing.
        router.addContentTypeParser(
          "application/json",
          { parseAs: "buffer" },
          (_req, body, done) => {
            try {
              const parsed: unknown = JSON.parse((body as Buffer).toString("utf8"));
              (_req as FastifyRequest).rawBody = body as Buffer;
              done(null, parsed);
            } catch (err) {
              done(err as Error, undefined);
            }
          },
        );

        router.post(
          "/razorpay",
          {
            schema: {
              description: "Razorpay webhook receiver — payment lifecycle events",
              tags: ["Webhooks"] as string[],
            },
          },
          this.handle,
        );
      },
      { prefix: "/webhooks" },
    );
  }

  private handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers["x-razorpay-signature"];

    // Always return 200 to stop Razorpay retries; log failures internally.
    const ok = () => {
      const { statusCode, payload } = successResponse({
        message: "ok",
        data: { received: true },
      });
      return reply.status(statusCode).send(payload);
    };

    if (typeof signature !== "string") {
      request.log.warn("razorpay webhook: missing signature header");
      return ok();
    }

    if (!request.rawBody) {
      request.log.error("razorpay webhook: rawBody not captured");
      return ok();
    }

    if (!verifyWebhookSignature(request.rawBody, signature)) {
      request.log.warn("razorpay webhook: invalid signature — ignoring event");
      return ok();
    }

    const event = request.body as RazorpayWebhookEvent;
    request.log.info({ event: event.event }, "razorpay webhook received");

    try {
      switch (event.event) {
        // ── One-time order payments ──────────────────────────────────────────
        case "payment.captured": {
          const payment = event.payload?.payment?.entity;
          if (!payment || payment.status !== "captured") break;
          // Skip — subscription payments are handled by subscription.charged
          if (payment.subscription_id) break;
          if (payment.order_id) {
            await this.activateByOrderId(request, payment.order_id, payment.id);
          }
          break;
        }

        case "order.paid": {
          const order = event.payload?.order?.entity;
          const payment = event.payload?.payment?.entity;
          const orderId = order?.id ?? payment?.order_id;
          const paymentId = payment?.id;
          // Skip subscription payments
          if (payment?.subscription_id) break;
          if (orderId && paymentId) {
            await this.activateByOrderId(request, orderId, paymentId);
          }
          break;
        }

        case "payment.failed": {
          const payment = event.payload?.payment?.entity;
          request.log.warn(
            { paymentId: payment?.id, orderId: payment?.order_id },
            "razorpay payment failed",
          );
          if (payment?.order_id && !payment.subscription_id) {
            await this.markOrderFailed(request, payment.order_id);
          }
          break;
        }

        // ── Recurring subscription events ────────────────────────────────────
        case "subscription.charged": {
          const sub = event.payload?.subscription?.entity;
          const payment = event.payload?.payment?.entity;
          if (!sub || !payment) break;

          const currentEnd = sub.current_end ? new Date(sub.current_end * 1000) : null;

          if ((sub.paid_count ?? 0) > 1) {
            // Renewal — extend the existing active subscription
            await this.renewSubscription(request, sub.id, payment.id, currentEnd);
          } else {
            // Initial charge — activate the pending subscription
            await this.activateBySubscriptionId(request, sub.id, payment.id, currentEnd);
          }
          break;
        }

        case "subscription.halted": {
          // Auto-renewal payment failed after retries — access should lapse
          const sub = event.payload?.subscription?.entity;
          if (sub?.id) {
            await this.expireSubscription(request, sub.id, "halted");
          }
          break;
        }

        case "subscription.cancelled": {
          const sub = event.payload?.subscription?.entity;
          if (sub?.id) {
            await this.cancelSubscription(request, sub.id);
          }
          break;
        }

        case "subscription.completed": {
          // All billing cycles exhausted
          const sub = event.payload?.subscription?.entity;
          if (sub?.id) {
            await this.expireSubscription(request, sub.id, "completed");
          }
          break;
        }
      }
    } catch (err) {
      request.log.error({ err }, "razorpay webhook: error processing event");
    }

    return ok();
  };

  // ── One-time order helpers ───────────────────────────────────────────────────

  private async activateByOrderId(
    request: FastifyRequest,
    razorpayOrderId: string,
    razorpayPaymentId: string,
  ) {
    const [existing] = await drizzle
      .select({
        id: userSubscriptions.id,
        status: userSubscriptions.status,
        sessionsTotal: userSubscriptions.sessionsTotal,
        billingInterval: plans.billingInterval,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(eq(userSubscriptions.razorpayOrderId, razorpayOrderId))
      .limit(1);

    if (!existing) {
      request.log.error({ razorpayOrderId }, "razorpay webhook: no subscription found for order");
      return;
    }

    if (existing.status === "active") {
      request.log.info({ razorpayOrderId }, "razorpay webhook: subscription already active");
      return;
    }

    if (existing.status !== "pending_payment") {
      request.log.warn(
        { razorpayOrderId, status: existing.status },
        "razorpay webhook: cannot activate subscription in non-pending state",
      );
      return;
    }

    const expiresAt = computeExpiresAt(existing.billingInterval, null);

    await drizzle
      .update(userSubscriptions)
      .set({ status: "active", razorpayPaymentId, expiresAt })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpayOrderId },
      "razorpay webhook: subscription activated",
    );
  }

  private async markOrderFailed(request: FastifyRequest, razorpayOrderId: string) {
    const [existing] = await drizzle
      .select({ id: userSubscriptions.id, status: userSubscriptions.status })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.razorpayOrderId, razorpayOrderId))
      .limit(1);

    if (!existing || existing.status !== "pending_payment") return;

    await drizzle
      .update(userSubscriptions)
      .set({ status: "cancelled" })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpayOrderId },
      "razorpay webhook: subscription cancelled due to payment failure",
    );
  }

  // ── Recurring subscription helpers ──────────────────────────────────────────

  private async activateBySubscriptionId(
    request: FastifyRequest,
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    currentEnd: Date | null,
  ) {
    const [existing] = await drizzle
      .select({
        id: userSubscriptions.id,
        status: userSubscriptions.status,
        sessionsTotal: userSubscriptions.sessionsTotal,
        billingInterval: plans.billingInterval,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(eq(userSubscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
      .limit(1);

    if (!existing) {
      request.log.error({ razorpaySubscriptionId }, "razorpay webhook: no subscription found");
      return;
    }

    if (existing.status === "active") {
      request.log.info({ razorpaySubscriptionId }, "razorpay webhook: subscription already active");
      return;
    }

    if (existing.status !== "pending_payment") {
      request.log.warn(
        { razorpaySubscriptionId, status: existing.status },
        "razorpay webhook: cannot activate subscription in non-pending state",
      );
      return;
    }

    const expiresAt = computeExpiresAt(existing.billingInterval, currentEnd);

    await drizzle
      .update(userSubscriptions)
      .set({ status: "active", razorpayPaymentId, expiresAt })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpaySubscriptionId },
      "razorpay webhook: subscription activated",
    );
  }

  private async renewSubscription(
    request: FastifyRequest,
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    currentEnd: Date | null,
  ) {
    const [existing] = await drizzle
      .select({
        id: userSubscriptions.id,
        status: userSubscriptions.status,
        sessionsTotal: userSubscriptions.sessionsTotal,
        billingInterval: plans.billingInterval,
      })
      .from(userSubscriptions)
      .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
      .where(eq(userSubscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
      .limit(1);

    if (!existing) {
      request.log.error({ razorpaySubscriptionId }, "razorpay webhook: no subscription found for renewal");
      return;
    }

    if (existing.status === "cancelled" || existing.status === "expired") {
      request.log.warn(
        { razorpaySubscriptionId, status: existing.status },
        "razorpay webhook: ignoring renewal for terminated subscription",
      );
      return;
    }

    const expiresAt = computeExpiresAt(existing.billingInterval, currentEnd);

    await drizzle
      .update(userSubscriptions)
      .set({
        status: "active",
        razorpayPaymentId,
        expiresAt,
        ...(existing.sessionsTotal !== null ? { sessionsUsed: 0 } : {}),
      })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpaySubscriptionId, expiresAt },
      "razorpay webhook: subscription renewed",
    );
  }

  private async expireSubscription(
    request: FastifyRequest,
    razorpaySubscriptionId: string,
    reason: string,
  ) {
    const [existing] = await drizzle
      .select({ id: userSubscriptions.id, status: userSubscriptions.status })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
      .limit(1);

    if (!existing || existing.status === "expired" || existing.status === "cancelled") return;

    await drizzle
      .update(userSubscriptions)
      .set({ status: "expired" })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpaySubscriptionId, reason },
      "razorpay webhook: subscription expired",
    );
  }

  private async cancelSubscription(request: FastifyRequest, razorpaySubscriptionId: string) {
    const [existing] = await drizzle
      .select({ id: userSubscriptions.id, status: userSubscriptions.status })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
      .limit(1);

    if (!existing || existing.status === "cancelled") return;

    await drizzle
      .update(userSubscriptions)
      .set({ status: "cancelled" })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpaySubscriptionId },
      "razorpay webhook: subscription cancelled",
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeExpiresAt(
  billingInterval: string,
  currentEnd: Date | null,
): Date {
  if (currentEnd) return currentEnd;
  const now = new Date();
  if (billingInterval === "week") {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  const d = new Date(now);
  d.setMonth(d.getMonth() + 1);
  return d;
}
