import { AuthMiddleware } from "../../middleware/auth.middleware";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { userSwaggerSchemas } from "../../validation/user.validation.schema";
import { successResponse, errorResponse } from "../../utils";
import db from "../../db";
import { z } from "zod";
import { validateWithZod } from "../../utils";
import { drizzle } from "../../db";
import { userPreferences, userAcquisition } from "../../schema/schema";
import { eq } from "drizzle-orm";

const saveAcquisitionSchema = z.object({
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
  landingPage: z.string().optional().nullable(),
});

const savePreferencesSchema = z.object({
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().optional().nullable(),
  purposes: z.array(z.string()).min(1),
  otherPurpose: z.string().optional().nullable(),
  preferredTimeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Flexible"]).optional().nullable(),
  timezone: z.string().min(1),
});

export class UserController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.get(
          "/detail",
          {
            preHandler: this.authMiddleware.handle,
            schema: userSwaggerSchemas.getUserDetail,
          },
          this.getUserDetail
        );

        router.get(
          "/preferences",
          { preHandler: this.authMiddleware.handle },
          this.getPreferences
        );

        router.post(
          "/preferences",
          { preHandler: this.authMiddleware.handle },
          this.savePreferences
        );

        router.post(
          "/acquisition",
          { preHandler: this.authMiddleware.handle },
          this.saveAcquisition
        );
      },

      { prefix: "/user" }
    );
  }

  private getUserDetail = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const user = request.user;
    if (!user) {
      const { statusCode, payload: body } = errorResponse({
        message: "User not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(body);
    }

    const { statusCode, payload: body } = successResponse({
      message: "User details fetched successfully",
      data: user,
    });
    return reply.status(statusCode).send(body);
  };

  private getPreferences = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;
    if (!userId) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const [row] = await drizzle
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    const { statusCode, payload } = successResponse({
      message: "User preferences",
      data: row ?? null,
    });
    return reply.status(statusCode).send(payload);
  };

  private saveAcquisition = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: saveAcquisitionSchema });
    if (invalid) return invalid;

    const userId = request.user?.id;
    if (!userId) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof saveAcquisitionSchema>;

    // Only save once per user — ignore if already recorded
    await drizzle
      .insert(userAcquisition)
      .values({
        userId,
        utmSource: body.utmSource ?? null,
        utmMedium: body.utmMedium ?? null,
        utmCampaign: body.utmCampaign ?? null,
        utmContent: body.utmContent ?? null,
        utmTerm: body.utmTerm ?? null,
        referrer: body.referrer ?? null,
        landingPage: body.landingPage ?? null,
      })
      .onConflictDoNothing();

    const { statusCode, payload } = successResponse({ message: "Acquisition recorded", data: null });
    return reply.status(statusCode).send(payload);
  };

  private savePreferences = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: savePreferencesSchema });
    if (invalid) return invalid;

    const userId = request.user?.id;
    if (!userId) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof savePreferencesSchema>;

    await drizzle
      .insert(userPreferences)
      .values({
        userId,
        gender: body.gender,
        phone: body.phone ?? null,
        purposes: body.purposes,
        otherPurpose: body.otherPurpose ?? null,
        preferredTimeOfDay: body.preferredTimeOfDay ?? null,
        timezone: body.timezone,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          gender: body.gender,
          phone: body.phone ?? null,
          purposes: body.purposes,
          otherPurpose: body.otherPurpose ?? null,
          preferredTimeOfDay: body.preferredTimeOfDay ?? null,
          timezone: body.timezone,
          updatedAt: new Date(),
        },
      });

    const { statusCode, payload } = successResponse({ message: "Preferences saved", data: null });
    return reply.status(statusCode).send(payload);
  };
}
