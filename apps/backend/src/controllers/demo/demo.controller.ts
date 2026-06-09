import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { drizzle } from "../../db";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import {
  createDemoRequest,
  notifyOnDemoCreated,
  getUserDemoRequests,
  updateUserDemoRequest,
  listAllDemoRequests,
  getDemoRequest,
  updateDemoStatus,
  assignDemoInstructor,
  scheduleDemoMeeting,
  completeDemoSession,
  getInstructorDemoSessions,
  notifyInstructorWithMeeting,
} from "../../services/demo-request.service";

// ── Validation schemas ────────────────────────────────────────────────────────

const DEMO_GENDERS = ["Male", "Female", "Other"] as const;
const DEMO_PURPOSES = [
  "Pregnancy",
  "Stress Relief",
  "Anxiety Management",
  "Flexibility Improvement",
  "Weight Loss",
  "Back Pain Relief",
  "Better Sleep",
  "General Fitness",
  "Other",
] as const;
const MEETING_PLATFORMS = ["google_meet", "zoom", "teams"] as const;

const createDemoRequestSchema = z
  .object({
    gender: z.enum(DEMO_GENDERS),
    phone: z.string().min(7, "Phone number is required"),
    purposes: z
      .array(z.enum(DEMO_PURPOSES))
      .min(1, "Select at least one goal"),
    otherPurpose: z.string().optional(),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    preferredTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
    timezone: z.string().min(1, "Timezone is required"),
  })
  .refine(
    (v) =>
      !v.purposes.includes("Other") ||
      (v.otherPurpose && v.otherPurpose.trim().length > 0),
    { message: "Please describe your goal", path: ["otherPurpose"] },
  );

const updateDemoStatusSchema = z
  .object({
    status: z.enum(["approved", "rejected", "needs_information"]),
    rejectionReason: z.string().optional(),
    needsInfoMessage: z.string().optional(),
    adminNotes: z.string().optional(),
  })
  .refine(
    (v) =>
      v.status !== "rejected" ||
      (v.rejectionReason && v.rejectionReason.trim().length > 0),
    { message: "Rejection reason is required", path: ["rejectionReason"] },
  )
  .refine(
    (v) =>
      v.status !== "needs_information" ||
      (v.needsInfoMessage && v.needsInfoMessage.trim().length > 0),
    { message: "Please specify what information is needed", path: ["needsInfoMessage"] },
  );

const assignInstructorSchema = z.object({
  instructorId: z.string().uuid("Invalid instructor id"),
});

const scheduleMeetingSchema = z.object({
  meetingLink: z.string().url("Must be a valid URL"),
  meetingPlatform: z.enum(MEETING_PLATFORMS),
});

const demoRequestIdSchema = z.object({
  id: z.string().uuid("Invalid request id"),
});

// ── Controller ────────────────────────────────────────────────────────────────

export class DemoController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const auth = this.authMiddleware.handle;
    const adminGuard = [auth, requireRole(USER_ROLES.ADMIN)];
    const instructorGuard = [auth, requireRole(USER_ROLES.INSTRUCTOR)];
    const userGuard = [auth, requireRole(USER_ROLES.USER)];

    // User routes
    app.register(
      async (router) => {
        router.post("/request", { preHandler: userGuard }, this.submitRequest);
        router.get("/my-requests", { preHandler: [auth] }, this.myRequests);
        router.patch(
          "/my-requests/:id",
          { preHandler: [auth] },
          this.updateMyRequest,
        );
      },
      { prefix: "/demo" },
    );

    // Admin routes
    app.register(
      async (router) => {
        router.get(
          "/demo-requests",
          { preHandler: adminGuard },
          this.adminListRequests,
        );
        router.get(
          "/demo-requests/:id",
          { preHandler: adminGuard },
          this.adminGetRequest,
        );
        router.patch(
          "/demo-requests/:id/status",
          { preHandler: adminGuard },
          this.adminUpdateStatus,
        );
        router.post(
          "/demo-requests/:id/assign-instructor",
          { preHandler: adminGuard },
          this.adminAssignInstructor,
        );
        router.post(
          "/demo-requests/:id/meeting",
          { preHandler: adminGuard },
          this.adminScheduleMeeting,
        );
        router.patch(
          "/demo-requests/:id/complete",
          { preHandler: adminGuard },
          this.adminComplete,
        );
      },
      { prefix: "/admin" },
    );

    // Instructor routes
    app.register(
      async (router) => {
        router.get(
          "/demo-sessions",
          { preHandler: instructorGuard },
          this.instructorSessions,
        );
        router.post(
          "/demo-sessions/:id/meeting",
          { preHandler: instructorGuard },
          this.instructorScheduleMeeting,
        );
      },
      { prefix: "/instructor" },
    );
  }

  // ── User: submit ──────────────────────────────────────────────────────────

  private submitRequest = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      body: createDemoRequestSchema,
    });
    if (invalid) return invalid;

    const me = request.user!;
    const body = request.body as z.infer<typeof createDemoRequestSchema>;

    try {
      const created = await createDemoRequest(drizzle, me.id, body);

      void notifyOnDemoCreated({
        adminEmail: process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM!,
        userName: me.name,
        userEmail: me.email,
        phone: body.phone,
        purposes: body.purposes,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        timezone: body.timezone,
      });

      const { statusCode, payload } = successResponse({
        message: "Demo request submitted",
        data: created,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "ACTIVE_REQUEST_EXISTS") {
        const { statusCode, payload } = errorResponse({
          message: "You already have an active demo request",
          statusCode: 409,
          error: "ACTIVE_REQUEST_EXISTS",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  // ── User: list own ────────────────────────────────────────────────────────

  private myRequests = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const me = request.user!;
    const data = await getUserDemoRequests(drizzle, me.id);
    const { statusCode, payload } = successResponse({
      message: "Demo requests",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  // ── User: update own (only when status = needs_information) ───────────────

  private updateMyRequest = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalidParams = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalidParams) return invalidParams;

    const invalid = validateWithZod(request, reply, {
      body: createDemoRequestSchema,
    });
    if (invalid) return invalid;

    const me = request.user!;
    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;
    const body = request.body as z.infer<typeof createDemoRequestSchema>;

    try {
      const updated = await updateUserDemoRequest(drizzle, id, me.id, body);
      if (!updated) {
        const { statusCode, payload } = errorResponse({
          message: "Demo request not found",
          statusCode: 404,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Demo request updated",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "REQUEST_NOT_EDITABLE") {
        const { statusCode, payload } = errorResponse({
          message: "This request can only be updated when additional information is needed",
          statusCode: 409,
          error: "REQUEST_NOT_EDITABLE",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  // ── Admin: list all ───────────────────────────────────────────────────────

  private adminListRequests = async (
    _req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const data = await listAllDemoRequests(drizzle);
    const { statusCode, payload } = successResponse({
      message: "Demo requests",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  // ── Admin: get single ─────────────────────────────────────────────────────

  private adminGetRequest = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;
    const data = await getDemoRequest(drizzle, id);

    if (!data) {
      const { statusCode, payload } = errorResponse({
        message: "Demo request not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Demo request",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  // ── Admin: update status ──────────────────────────────────────────────────

  private adminUpdateStatus = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalidParams = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, {
      body: updateDemoStatusSchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;
    const body = request.body as z.infer<typeof updateDemoStatusSchema>;

    try {
      const result = await updateDemoStatus(drizzle, id, body);
      if (!result) {
        const { statusCode, payload } = errorResponse({
          message: "Demo request not found",
          statusCode: 404,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Status updated",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_STATUS_TRANSITION") {
        const { statusCode, payload } = errorResponse({
          message: "This status transition is not allowed",
          statusCode: 409,
          error: "INVALID_STATUS_TRANSITION",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  // ── Admin: assign instructor ──────────────────────────────────────────────

  private adminAssignInstructor = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalidParams = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, {
      body: assignInstructorSchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;
    const { instructorId } = request.body as z.infer<
      typeof assignInstructorSchema
    >;

    try {
      const ok = await assignDemoInstructor(drizzle, id, instructorId);
      if (!ok) {
        const { statusCode, payload } = errorResponse({
          message: "Demo request not found",
          statusCode: 404,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Instructor assigned",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "REQUEST_NOT_APPROVED") {
        const { statusCode, payload } = errorResponse({
          message: "Request must be approved before assigning an instructor",
          statusCode: 409,
          error: "REQUEST_NOT_APPROVED",
        });
        return reply.status(statusCode).send(payload);
      }
      if (err instanceof Error && err.message === "INSTRUCTOR_NOT_FOUND") {
        const { statusCode, payload } = errorResponse({
          message: "Instructor not found",
          statusCode: 404,
          error: "INSTRUCTOR_NOT_FOUND",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  // ── Admin: schedule meeting ───────────────────────────────────────────────

  private adminScheduleMeeting = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    return this.handleScheduleMeeting(request, reply);
  };

  // ── Admin: mark completed ─────────────────────────────────────────────────

  private adminComplete = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;

    try {
      const ok = await completeDemoSession(drizzle, id);
      if (!ok) {
        const { statusCode, payload } = errorResponse({
          message: "Demo request not found",
          statusCode: 404,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Demo session marked as completed",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_STATUS_TRANSITION") {
        const { statusCode, payload } = errorResponse({
          message: "Session can only be completed after the meeting is scheduled",
          statusCode: 409,
          error: "INVALID_STATUS_TRANSITION",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };

  // ── Instructor: own sessions ──────────────────────────────────────────────

  private instructorSessions = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const me = request.user!;
    const data = await getInstructorDemoSessions(drizzle, me.id);
    const { statusCode, payload } = successResponse({
      message: "Demo sessions",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  // ── Instructor: schedule meeting ──────────────────────────────────────────

  private instructorScheduleMeeting = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    return this.handleScheduleMeeting(request, reply, request.user!.id);
  };

  // ── Shared meeting scheduling logic ──────────────────────────────────────

  private handleScheduleMeeting = async (
    request: FastifyRequest,
    reply: FastifyReply,
    _actorId?: string,
  ) => {
    const invalidParams = validateWithZod(request, reply, {
      params: demoRequestIdSchema,
    });
    if (invalidParams) return invalidParams;

    const invalidBody = validateWithZod(request, reply, {
      body: scheduleMeetingSchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof demoRequestIdSchema>;
    const { meetingLink, meetingPlatform } = request.body as z.infer<
      typeof scheduleMeetingSchema
    >;

    try {
      const ok = await scheduleDemoMeeting(
        drizzle,
        id,
        meetingLink,
        meetingPlatform,
      );
      if (!ok) {
        const { statusCode, payload } = errorResponse({
          message: "Demo request not found",
          statusCode: 404,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Meeting scheduled",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      if (err instanceof Error && err.message === "INSTRUCTOR_NOT_ASSIGNED") {
        const { statusCode, payload } = errorResponse({
          message: "An instructor must be assigned before scheduling a meeting",
          statusCode: 409,
          error: "INSTRUCTOR_NOT_ASSIGNED",
        });
        return reply.status(statusCode).send(payload);
      }
      throw err;
    }
  };
}
