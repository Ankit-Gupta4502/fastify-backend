import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createOrderBodySchema,
  verifyPaymentBodySchema,
} from "@yoga-app/shared";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { drizzle } from "../../db";
import { plans, user } from "../../schema/schema";
import {
  getRazorpay,
  getRazorpayKeyId,
  verifyPaymentSignature,
} from "../../services/razorpay.service";
import { errorResponse, successResponse, validateWithZod } from "../../utils";

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
              description: "Create a Razorpay order for a plan",
              tags: ["Payments"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.createOrder,
        );

        router.post(
          "/verify",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Verify Razorpay payment signature and activate plan",
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

  private createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: createOrderBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof createOrderBodySchema>;

    const [plan] = await drizzle
      .select()
      .from(plans)
      .where(eq(plans.id, body.planId));

    if (!plan) {
      const { statusCode, payload } = errorResponse({
        message: "Plan not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      const order = await getRazorpay().orders.create({
        amount: plan.priceCents, // stored in cents; Razorpay expects smallest unit (cents for USD)
        currency: "USD",
        receipt: `plan-${plan.id}-${me.id.slice(0, 8)}-${Date.now()}`,
        notes: { userId: me.id, planId: plan.id, planName: plan.name },
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
      request.log.error({ err }, "razorpay order create failed");
      const { statusCode, payload } = errorResponse({
        message: "Could not create payment order",
        statusCode: 502,
      });
      return reply.status(statusCode).send(payload);
    }
  };

  private verify = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: verifyPaymentBodySchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({
        message: "Unauthorized",
        statusCode: 401,
      });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof verifyPaymentBodySchema>;

    const ok = verifyPaymentSignature({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });

    if (!ok) {
      const { statusCode, payload } = errorResponse({
        message: "Invalid payment signature",
        statusCode: 400,
        error: "INVALID_SIGNATURE",
      });
      return reply.status(statusCode).send(payload);
    }

    await drizzle
      .update(user)
      .set({ planId: body.planId })
      .where(eq(user.id, me.id));

    const { statusCode, payload } = successResponse({
      message: "Payment verified",
      data: { success: true as const, planId: body.planId },
    });
    return reply.status(statusCode).send(payload);
  };
}
