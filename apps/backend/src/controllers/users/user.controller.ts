import { AuthMiddleware } from "../../middleware/auth.middleware";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  completeOnboardingBodySchema,
  saveAcquisitionSchema,
  savePreferencesSchema,
  userSwaggerSchemas,
} from "../../validation/user.validation.schema";
import { successResponse, errorResponse, validateWithZod } from "../../utils";
import { z } from "zod";
import { drizzle } from "../../db";
import { user as userTable, userPreferences, userAcquisition } from "../../schema/schema";
import { eq } from "drizzle-orm";
import { createOrganizationForUser } from "../../services/organization.service";

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

        router.post(
          "/onboarding",
          { preHandler: this.authMiddleware.handle },
          this.completeOnboarding
        );
      },

      { prefix: "/user" }
    );
  }

  private getUserDetail = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const sessionUser = request.user;
    if (!sessionUser) {
      const { statusCode, payload: body } = errorResponse({
        message: "User not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(body);
    }

    // better-auth's getSession() only includes additionalFields marked
    // `required: true` in its session payload — required:false fields
    // (onboardingCompletedAt, referredByUserId, referralCode) are silently
    // omitted even though they're set in the DB, so read this one fresh.
    const [row] = await drizzle
      .select({ onboardingCompletedAt: userTable.onboardingCompletedAt })
      .from(userTable)
      .where(eq(userTable.id, sessionUser.id));

    const user = {
      ...sessionUser,
      onboardingCompletedAt: row?.onboardingCompletedAt ?? null,
    };

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

  private completeOnboarding = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: completeOnboardingBodySchema });
    if (invalid) return invalid;

    const userId = request.user?.id;
    const userEmail = request.user?.email;
    if (!userId || !userEmail) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const body = request.body as z.infer<typeof completeOnboardingBodySchema>;

    if (body.accountType === "company") {
      const { organizationId } = await createOrganizationForUser({
        createdByUserId: userId,
        createdByEmail: userEmail,
        name: body.organization.name,
        sizeBand: body.organization.sizeBand,
      });

      const { statusCode, payload } = successResponse({
        message: "Organization created",
        data: { organizationId },
      });
      return reply.status(statusCode).send(payload);
    }

    await drizzle
      .update(userTable)
      .set({ onboardingCompletedAt: new Date() })
      .where(eq(userTable.id, userId));

    const { statusCode, payload } = successResponse({
      message: "Onboarding completed",
      data: { organizationId: null },
    });
    return reply.status(statusCode).send(payload);
  };
}
