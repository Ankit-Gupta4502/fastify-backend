import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { plans, userSubscriptions } from "../../schema/schema";
import { verifyWebhookSignature } from "../../services/razorpay.service";
import { successResponse } from "../../utils";

// Razorpay sends these in payment.captured and order.paid payloads
interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  notes?: Record<string, string>;
}

interface RazorpayOrderEntity {
  id: string;
  status: string;
  notes?: Record<string, string>;
}

interface RazorpayWebhookEvent {
  entity: string;
  event: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
    order?: { entity?: RazorpayOrderEntity };
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
      if (event.event === "payment.captured") {
        const payment = event.payload?.payment?.entity;
        if (payment?.status === "captured") {
          await this.activateSubscription(request, payment.order_id, payment.id);
        }
      } else if (event.event === "order.paid") {
        const order = event.payload?.order?.entity;
        const payment = event.payload?.payment?.entity;
        const orderId = order?.id ?? payment?.order_id;
        const paymentId = payment?.id;
        if (orderId && paymentId) {
          await this.activateSubscription(request, orderId, paymentId);
        }
      } else if (event.event === "payment.failed") {
        const payment = event.payload?.payment?.entity;
        request.log.warn(
          { paymentId: payment?.id, orderId: payment?.order_id },
          "razorpay payment failed",
        );
        if (payment?.order_id) {
          await this.markSubscriptionFailed(request, payment.order_id);
        }
      }
    } catch (err) {
      request.log.error({ err }, "razorpay webhook: error processing event");
    }

    return ok();
  };

  private async activateSubscription(
    request: FastifyRequest,
    razorpayOrderId: string,
    razorpayPaymentId: string,
  ) {
    // Idempotency: skip if already activated by the verify endpoint or a prior webhook.
    const [existing] = await drizzle
      .select({
        id: userSubscriptions.id,
        status: userSubscriptions.status,
        sessionsTotal: userSubscriptions.sessionsTotal,
        purchasedAt: userSubscriptions.purchasedAt,
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

    let expiresAt: Date | null = null;
    if (existing.sessionsTotal === null) {
      const now = new Date();
      if (existing.billingInterval === "week") {
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else {
        const d = new Date(now);
        d.setMonth(d.getMonth() + 1);
        expiresAt = d;
      }
    }

    await drizzle
      .update(userSubscriptions)
      .set({ status: "active", razorpayPaymentId, expiresAt })
      .where(eq(userSubscriptions.id, existing.id));

    request.log.info(
      { subscriptionId: existing.id, razorpayOrderId },
      "razorpay webhook: subscription activated",
    );
  }

  private async markSubscriptionFailed(
    request: FastifyRequest,
    razorpayOrderId: string,
  ) {
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
}
