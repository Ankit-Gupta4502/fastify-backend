import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createContactQuerySchema, createCorporateInquirySchema } from "@yoga-app/shared";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  createContactQuery,
  listContactQueries,
  markContactQueryResolved,
  createCorporateInquiry,
  listCorporateInquiries,
  markCorporateInquiryResolved,
} from "../../services/contact.service";

const contactQueryIdSchema = z.object({
  id: z.string().uuid("Invalid query id"),
});

export class ContactController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const adminGuard = [
      this.authMiddleware.handle,
      requireRole(USER_ROLES.ADMIN),
    ];

    // Public
    app.register(
      async (router) => {
        router.post("/", {}, this.submit);
      },
      { prefix: "/contact" },
    );
    app.post("/corporate-inquiries", {}, this.submitCorporateInquiry);

    // Admin
    app.register(
      async (router) => {
        router.get(
          "/contact-queries",
          { preHandler: adminGuard },
          this.adminList,
        );
        router.patch(
          "/contact-queries/:id/resolve",
          { preHandler: adminGuard },
          this.adminMarkResolved,
        );
        router.get("/corporate-inquiries", { preHandler: adminGuard }, this.adminListCorporate);
        router.patch("/corporate-inquiries/:id/resolve", { preHandler: adminGuard }, this.adminMarkCorporateResolved);
      },
      { prefix: "/admin" },
    );
  }

  private submit = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: createContactQuerySchema,
    });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createContactQuerySchema>;
    const created = await createContactQuery(drizzle, body);

    const { statusCode, payload } = successResponse({
      message: "Message sent",
      data: created,
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };

  private adminList = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await listContactQueries(drizzle);
    const { statusCode, payload } = successResponse({
      message: "Contact queries",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  private adminMarkResolved = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      params: contactQueryIdSchema,
    });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof contactQueryIdSchema>;
    const ok = await markContactQueryResolved(drizzle, id);

    if (!ok) {
      const { statusCode, payload } = errorResponse({
        message: "Contact query not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Marked as resolved",
      data: null,
    });
    return reply.status(statusCode).send(payload);
  };

  private submitCorporateInquiry = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: createCorporateInquirySchema });
    if (invalid) return invalid;
    const created = await createCorporateInquiry(drizzle, request.body as z.infer<typeof createCorporateInquirySchema>);
    const { statusCode, payload } = successResponse({ message: "Consultation request received", data: created, statusCode: 201 });
    return reply.status(statusCode).send(payload);
  };

  private adminListCorporate = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await listCorporateInquiries(drizzle);
    const { statusCode, payload } = successResponse({ message: "Corporate inquiries", data });
    return reply.status(statusCode).send(payload);
  };

  private adminMarkCorporateResolved = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { params: contactQueryIdSchema });
    if (invalid) return invalid;
    const { id } = request.params as z.infer<typeof contactQueryIdSchema>;
    const ok = await markCorporateInquiryResolved(drizzle, id);
    if (!ok) {
      const { statusCode, payload } = errorResponse({ message: "Corporate inquiry not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }
    const { statusCode, payload } = successResponse({ message: "Marked as resolved", data: null });
    return reply.status(statusCode).send(payload);
  };
}
