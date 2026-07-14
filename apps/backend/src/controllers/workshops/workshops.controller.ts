import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { registeredWorkshops, workshops } from "../../schema/schema";
import { detectCountry, errorResponse, successResponse, validateWithZod } from "../../utils";
import { deleteFile } from "../../services/upload.service";
import { getRazorpay, getRazorpayKeyId, verifyPaymentSignature } from "../../services/razorpay.service";
import { sendWorkshopConfirmationEmail } from "../../services/workshop-email.service";
import { createBodySchema, joinBodySchema, updateBodySchema } from "../../validation/workshops.validation.schema";

export class WorkshopsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const adminGuard = [this.authMiddleware.handle, requireRole(USER_ROLES.ADMIN)];

    app.register(
      async (router) => {
        // ── Public ──────────────────────────────────────────────
        router.get("/workshops", this.listActive);
        router.get("/workshops/:id", this.getWorkshop);

        // ── Authenticated ────────────────────────────────────────
        router.post("/workshops/:id/create-order", { preHandler: [this.authMiddleware.handle] }, this.createOrder);
        router.post("/workshops/:id/join", { preHandler: [this.authMiddleware.handle] }, this.joinWorkshop);

        // ── Admin ────────────────────────────────────────────────
        router.get("/admin/workshops", { preHandler: adminGuard }, this.adminList);
        router.post("/admin/workshops", { preHandler: adminGuard }, this.adminCreate);
        router.patch("/admin/workshops/:id", { preHandler: adminGuard }, this.adminUpdate);
        router.delete("/admin/workshops/:id", { preHandler: adminGuard }, this.adminDelete);
      },
      { prefix: "/" },
    );
  }

  private listActive = async (request: FastifyRequest, reply: FastifyReply) => {
    const isIndia = detectCountry(request, undefined) === "IN";

    const rows = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        content: workshops.content,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
        utmPriceInr: workshops.utmPriceInr,
        utmPriceUsd: workshops.utmPriceUsd,
        image: workshops.image,
        meetLink: workshops.meetLink,
        scheduledAt: workshops.scheduledAt,
        maxAttendees: workshops.maxAttendees,
      })
      .from(workshops)
      .where(eq(workshops.isActive, true))
      .orderBy(workshops.scheduledAt);

    const ids = rows.map((r) => r.id);
    const counts =
      ids.length > 0
        ? await drizzle
            .select({ workshopId: registeredWorkshops.workshopId, n: count() })
            .from(registeredWorkshops)
            .where(inArray(registeredWorkshops.workshopId, ids))
            .groupBy(registeredWorkshops.workshopId)
        : [];

    const countMap = Object.fromEntries(counts.map((c) => [c.workshopId, Number(c.n)]));

    const data = rows.map((r) => ({
      ...r,
      scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
      attendeeCount: countMap[r.id] ?? 0,
      isIndia,
    }));

    const { statusCode, payload } = successResponse({ message: "Active workshops", data });
    return reply.status(statusCode).send(payload);
  };

  private getWorkshop = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const isIndia = detectCountry(request, undefined) === "IN";

    const [row] = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        content: workshops.content,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
        utmPriceInr: workshops.utmPriceInr,
        utmPriceUsd: workshops.utmPriceUsd,
        image: workshops.image,
        meetLink: workshops.meetLink,
        scheduledAt: workshops.scheduledAt,
        maxAttendees: workshops.maxAttendees,
      })
      .from(workshops)
      .where(and(eq(workshops.id, id), eq(workshops.isActive, true)));

    if (!row) {
      const { statusCode, payload } = errorResponse({ message: "Workshop not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const [attendees] = await drizzle
      .select({ n: count() })
      .from(registeredWorkshops)
      .where(eq(registeredWorkshops.workshopId, id));

    const data = {
      ...row,
      scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
      attendeeCount: Number(attendees?.n ?? 0),
      isIndia,
    };

    const { statusCode, payload } = successResponse({ message: "Workshop", data });
    return reply.status(statusCode).send(payload);
  };

  private createOrder = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const [workshop] = await drizzle
      .select({ id: workshops.id, isActive: workshops.isActive, name: workshops.name, utmPriceInr: workshops.utmPriceInr, utmPriceUsd: workshops.utmPriceUsd })
      .from(workshops)
      .where(eq(workshops.id, id));

    if (!workshop) {
      const { statusCode, payload } = errorResponse({ message: "Workshop not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }
    if (!workshop.isActive) {
      const { statusCode, payload } = errorResponse({ message: "Workshop is not active", statusCode: 400 });
      return reply.status(statusCode).send(payload);
    }

    const country = detectCountry(request, undefined);
    const isIndia = country === "IN";
    const amount = isIndia ? workshop.utmPriceInr : workshop.utmPriceUsd;
    const currency = isIndia ? "INR" : "USD";

    // If the workshop is free for this country (price=0), skip Razorpay entirely
    if (amount === 0) {
      const { statusCode, payload } = successResponse({
        message: "Order created",
        data: { orderId: null, keyId: "", amount: 0, currency },
      });
      return reply.status(statusCode).send(payload);
    }

    try {
      const order = await getRazorpay().orders.create({
        amount,
        currency,
        notes: { workshopId: workshop.id, workshopName: workshop.name, isIndia: isIndia ? "1" : "0" },
      });

      const { statusCode, payload } = successResponse({
        message: "Order created",
        data: { orderId: order.id, keyId: getRazorpayKeyId(), amount, currency },
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      request.log.error({ err }, "razorpay workshop order create failed");
      const { statusCode, payload } = errorResponse({ message: "Could not create payment order", statusCode: 502 });
      return reply.status(statusCode).send(payload);
    }
  };

  private joinWorkshop = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: joinBodySchema });
    if (invalid) return invalid;

    const { id } = request.params as { id: string };
    const body = request.body as z.infer<typeof joinBodySchema>;
    const user = request.user as { id: string; name: string; email: string };

    const [workshop] = await drizzle
      .select({ id: workshops.id, isActive: workshops.isActive, maxAttendees: workshops.maxAttendees, utmPriceInr: workshops.utmPriceInr, utmPriceUsd: workshops.utmPriceUsd })
      .from(workshops)
      .where(eq(workshops.id, id));

    if (!workshop) {
      const { statusCode, payload } = errorResponse({ message: "Workshop not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }
    if (!workshop.isActive) {
      const { statusCode, payload } = errorResponse({ message: "Workshop is not active", statusCode: 400 });
      return reply.status(statusCode).send(payload);
    }

    const [countResult, existing] = await Promise.all([
      drizzle.select({ n: count() }).from(registeredWorkshops).where(eq(registeredWorkshops.workshopId, id)),
      drizzle
        .select({ id: registeredWorkshops.id })
        .from(registeredWorkshops)
        .where(and(eq(registeredWorkshops.workshopId, id), eq(registeredWorkshops.email, user.email))),
    ]);

    if (existing.length > 0) {
      const { statusCode, payload } = errorResponse({ message: "Already registered", statusCode: 409 });
      return reply.status(statusCode).send(payload);
    }

    if (Number(countResult[0]?.n ?? 0) >= workshop.maxAttendees) {
      const { statusCode, payload } = errorResponse({ message: "Workshop is full", statusCode: 409 });
      return reply.status(statusCode).send(payload);
    }

    const utmSource = body.utmSource ?? null;

    // Payment is required if UTM source is present AND the workshop's price for this visitor's
    // detected country/currency is non-zero — must mirror createOrder's per-country resolution,
    // otherwise a workshop priced free in one currency but paid in the other incorrectly blocks
    // the free currency's registrations with a false "payment required" error.
    const country = detectCountry(request, undefined);
    const isIndia = country === "IN";
    const expectedUtmPrice = isIndia ? workshop.utmPriceInr : workshop.utmPriceUsd;
    const requiresPayment = !!utmSource && expectedUtmPrice > 0;

    let pricePaid: number | null = null;
    let currency: string | null = null;
    let razorpayOrderId: string | null = null;
    let razorpayPaymentId: string | null = null;

    if (requiresPayment) {
      const { razorpayOrderId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature } = body;

      if (!orderId || !paymentId || !signature) {
        const { statusCode, payload } = errorResponse({ message: "Payment required", statusCode: 402 });
        return reply.status(statusCode).send(payload);
      }

      const valid = verifyPaymentSignature({ orderId, paymentId, signature });
      if (!valid) {
        const { statusCode, payload } = errorResponse({ message: "Invalid payment signature", statusCode: 400 });
        return reply.status(statusCode).send(payload);
      }

      // Fetch order from Razorpay to verify it was created for this specific workshop
      let rzOrder: { amount: number | string; notes: Record<string, string> };
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rzOrder = (await getRazorpay().orders.fetch(orderId)) as any;
      } catch (err) {
        request.log.error({ err }, "razorpay order fetch failed during join");
        const { statusCode, payload } = errorResponse({ message: "Could not verify payment", statusCode: 502 });
        return reply.status(statusCode).send(payload);
      }

      if (rzOrder.notes?.workshopId !== id) {
        const { statusCode, payload } = errorResponse({ message: "Payment does not belong to this workshop", statusCode: 400 });
        return reply.status(statusCode).send(payload);
      }

      // Guard against the same order being used twice
      const [usedOrder] = await drizzle
        .select({ id: registeredWorkshops.id })
        .from(registeredWorkshops)
        .where(eq(registeredWorkshops.razorpayOrderId, orderId));

      if (usedOrder) {
        const { statusCode, payload } = errorResponse({ message: "Payment already used", statusCode: 409 });
        return reply.status(statusCode).send(payload);
      }

      // Use the amount and country from the Razorpay order — authoritative, avoids country re-detection mismatch
      pricePaid = Number(rzOrder.amount);
      currency = rzOrder.notes?.isIndia === "1" ? "INR" : "USD";
      razorpayOrderId = orderId;
      razorpayPaymentId = paymentId;
    }

    await drizzle.insert(registeredWorkshops).values({
      workshopId: id,
      userId: user.id,
      name: user.name,
      email: user.email,
      utmSource,
      razorpayOrderId,
      razorpayPaymentId,
      pricePaid,
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    sendWorkshopConfirmationEmail({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      workshopId: id,
      pricePaid,
      currency,
    }).catch((err) => request.log.error({ err }, "workshop confirmation email failed"));

    const { statusCode, payload } = successResponse({ message: "Registered successfully", data: null, statusCode: 201 });
    return reply.status(statusCode).send(payload);
  };

  private adminList = async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        content: workshops.content,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
        utmPriceInr: workshops.utmPriceInr,
        utmPriceUsd: workshops.utmPriceUsd,
        image: workshops.image,
        meetLink: workshops.meetLink,
        scheduledAt: workshops.scheduledAt,
        maxAttendees: workshops.maxAttendees,
        isActive: workshops.isActive,
        createdAt: workshops.createdAt,
      })
      .from(workshops)
      .orderBy(desc(workshops.createdAt));

    const ids = rows.map((r) => r.id);
    const counts =
      ids.length > 0
        ? await drizzle
            .select({ workshopId: registeredWorkshops.workshopId, n: count() })
            .from(registeredWorkshops)
            .where(inArray(registeredWorkshops.workshopId, ids))
            .groupBy(registeredWorkshops.workshopId)
        : [];

    const countMap = Object.fromEntries(counts.map((c) => [c.workshopId, Number(c.n)]));

    const data = rows.map((r) => ({
      ...r,
      scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      attendeeCount: countMap[r.id] ?? 0,
    }));

    const { statusCode, payload } = successResponse({ message: "Workshops", data });
    return reply.status(statusCode).send(payload);
  };

  private adminCreate = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: createBodySchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createBodySchema>;

    const [row] = await drizzle
      .insert(workshops)
      .values({
        name: body.name,
        description: body.description,
        content: body.content ?? null,
        priceInr: body.priceInr ?? null,
        priceUsd: body.priceUsd ?? null,
        utmPriceInr: body.utmPriceInr ?? 9900,
        utmPriceUsd: body.utmPriceUsd ?? 100,
        image: body.image ?? null,
        meetLink: body.meetLink ?? null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        maxAttendees: body.maxAttendees ?? 50,
        isActive: body.isActive ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const { statusCode, payload } = successResponse({
      message: "Workshop created",
      data: { id: row.id },
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };

  private adminUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: updateBodySchema });
    if (invalid) return invalid;

    const { id } = request.params as { id: string };
    const body = request.body as z.infer<typeof updateBodySchema>;

    // Fetch current image key before overwriting so we can delete from R2
    let oldImageKey: string | null = null;
    if (body.image !== undefined) {
      const [current] = await drizzle
        .select({ image: workshops.image })
        .from(workshops)
        .where(eq(workshops.id, id));
      oldImageKey = current?.image ?? null;
    }

    const [updated] = await drizzle
      .update(workshops)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.priceInr !== undefined && { priceInr: body.priceInr }),
        ...(body.priceUsd !== undefined && { priceUsd: body.priceUsd }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.meetLink !== undefined && { meetLink: body.meetLink }),
        ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
        ...(body.maxAttendees !== undefined && { maxAttendees: body.maxAttendees }),
        ...(body.utmPriceInr !== undefined && { utmPriceInr: body.utmPriceInr }),
        ...(body.utmPriceUsd !== undefined && { utmPriceUsd: body.utmPriceUsd }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(workshops.id, id))
      .returning();

    if (!updated) {
      const { statusCode, payload } = errorResponse({ message: "Workshop not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    // Delete old image from R2 if it was replaced
    if (oldImageKey && body.image !== oldImageKey) {
      const key = oldImageKey.replace(/^https?:\/\/[^/]+\//, "");
      deleteFile(key).catch(() => {});
    }

    const { statusCode, payload } = successResponse({ message: "Workshop updated", data: null });
    return reply.status(statusCode).send(payload);
  };

  private adminDelete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const [deleted] = await drizzle
      .delete(workshops)
      .where(eq(workshops.id, id))
      .returning();

    if (!deleted) {
      const { statusCode, payload } = errorResponse({ message: "Workshop not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    if (deleted.image) {
      const key = deleted.image.replace(/^https?:\/\/[^/]+\//, "");
      deleteFile(key).catch(() => {});
    }

    const { statusCode, payload } = successResponse({ message: "Workshop deleted", data: null });
    return reply.status(statusCode).send(payload);
  };
}
