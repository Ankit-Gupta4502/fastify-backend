import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { plans, user } from "../../schema/schema";
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
        // Override the JSON content-type parser for this scope only so we can
        // capture the raw bytes needed for HMAC verification before parsing.
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
        if (payment) {
          await this.handlePaymentCaptured(request, payment);
        }
      } else if (event.event === "order.paid") {
        const order = event.payload?.order?.entity;
        const payment = event.payload?.payment?.entity;
        // notes are on the order; fall back to payment notes
        const notes = order?.notes ?? payment?.notes;
        if (notes) {
          await this.activatePlan(request, notes);
        }
      } else if (event.event === "payment.failed") {
        const payment = event.payload?.payment?.entity;
        request.log.warn(
          { paymentId: payment?.id, orderId: payment?.order_id },
          "razorpay payment failed",
        );
      }
      // All other events are acknowledged without action
    } catch (err) {
      request.log.error({ err }, "razorpay webhook: error processing event");
      // Still return 200 — we've logged it; retrying won't help a logic error
    }

    return ok();
  };

  private async handlePaymentCaptured(
    request: FastifyRequest,
    payment: RazorpayPaymentEntity,
  ) {
    if (payment.status !== "captured") return;
    const notes = payment.notes;
    if (!notes) return;
    await this.activatePlan(request, notes);
  }

  private async activatePlan(
    request: FastifyRequest,
    notes: Record<string, string>,
  ) {
    const { userId, planId } = notes;
    if (!userId || !planId) {
      request.log.warn({ notes }, "razorpay webhook: notes missing userId/planId");
      return;
    }

    // Confirm the plan exists before writing
    const [plan] = await drizzle
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.id, planId));

    if (!plan) {
      request.log.error({ planId }, "razorpay webhook: unknown planId in notes");
      return;
    }

    await drizzle
      .update(user)
      .set({ planId })
      .where(eq(user.id, userId));

    request.log.info({ userId, planId }, "razorpay webhook: plan activated");
  }
}
