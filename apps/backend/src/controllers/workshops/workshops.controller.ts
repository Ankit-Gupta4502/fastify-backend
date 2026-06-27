import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { registeredWorkshops, workshops } from "../../schema/schema";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import { deleteFile } from "../../services/upload.service";

const joinBodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priceInr: z.number().int().min(0).optional().nullable(),
  priceUsd: z.number().int().min(0).optional().nullable(),
  image: z.string().url().optional().nullable(),
  meetLink: z.string().url().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  maxAttendees: z.number().int().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});

const updateBodySchema = createBodySchema.partial();

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
        router.post("/workshops/:id/join", this.joinWorkshop);

        // ── Admin ────────────────────────────────────────────────
        router.get("/admin/workshops", { preHandler: adminGuard }, this.adminList);
        router.post("/admin/workshops", { preHandler: adminGuard }, this.adminCreate);
        router.patch("/admin/workshops/:id", { preHandler: adminGuard }, this.adminUpdate);
        router.delete("/admin/workshops/:id", { preHandler: adminGuard }, this.adminDelete);
      },
      { prefix: "/" },
    );
  }

  private listActive = async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
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
    }));

    const { statusCode, payload } = successResponse({ message: "Active workshops", data });
    return reply.status(statusCode).send(payload);
  };

  private getWorkshop = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const [row] = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
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
    };

    const { statusCode, payload } = successResponse({ message: "Workshop", data });
    return reply.status(statusCode).send(payload);
  };

  private joinWorkshop = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: joinBodySchema });
    if (invalid) return invalid;

    const { id } = request.params as { id: string };
    const body = request.body as z.infer<typeof joinBodySchema>;

    const [workshop] = await drizzle
      .select({ id: workshops.id, isActive: workshops.isActive })
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

    const existing = await drizzle
      .select({ id: registeredWorkshops.id })
      .from(registeredWorkshops)
      .where(
        and(
          eq(registeredWorkshops.workshopId, id),
          eq(registeredWorkshops.email, body.email),
        ),
      );

    if (existing.length > 0) {
      const { statusCode, payload } = errorResponse({ message: "Already registered", statusCode: 409 });
      return reply.status(statusCode).send(payload);
    }

    await drizzle.insert(registeredWorkshops).values({
      workshopId: id,
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const { statusCode, payload } = successResponse({ message: "Registered successfully", data: null, statusCode: 201 });
    return reply.status(statusCode).send(payload);
  };

  private adminList = async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await drizzle
      .select({
        id: workshops.id,
        name: workshops.name,
        description: workshops.description,
        priceInr: workshops.priceInr,
        priceUsd: workshops.priceUsd,
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
        priceInr: body.priceInr ?? null,
        priceUsd: body.priceUsd ?? null,
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
        ...(body.priceInr !== undefined && { priceInr: body.priceInr }),
        ...(body.priceUsd !== undefined && { priceUsd: body.priceUsd }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.meetLink !== undefined && { meetLink: body.meetLink }),
        ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
        ...(body.maxAttendees !== undefined && { maxAttendees: body.maxAttendees }),
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
