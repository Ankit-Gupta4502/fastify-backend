import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireOrgAdmin } from "../../middleware/org.middleware";
import {
  acceptOrgInvite,
  createOrganizationSeatPurchase,
  getInviteByToken,
  getOrganizationById,
  getOrganizationCouponForMember,
  inviteMembersToOrganization,
  listCorporatePlans,
  listOrganizationClasses,
  listOrganizationMembers,
  listOrganizationsForUser,
  promoteOrgMember,
  removeOrgMember,
  verifyOrganizationSeatPurchase,
} from "../../services/organization.service";
import { verifySubscriptionSignature } from "../../services/razorpay.service";
import {
  createSeatPurchaseBodySchema,
  inviteMembersBodySchema,
  inviteTokenParamsSchema,
  memberIdParamsSchema,
  organizationIdParamsSchema,
  verifySeatPurchaseBodySchema,
} from "../../validation/organization.validation.schema";
import { detectCountry, errorResponse, successResponse, validateWithZod } from "../../utils";

export class OrganizationsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.get(
          "/me",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "List organizations the current user is a joined member of",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getMyOrganizations,
        );
        router.get(
          "/invites/:token",
          {
            schema: {
              description: "Preview an organization invite before accepting it",
              tags: ["Organizations"] as string[],
            },
          },
          this.getInvite,
        );
        router.post(
          "/invites/:token/accept",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Accept an organization invite as the current user",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.acceptInvite,
        );
        router.get(
          "/:id/members",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "List an organization's members and pending invites",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getMembers,
        );
        router.patch(
          "/:id/members/:memberId/promote",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "Promote a joined member to co-admin",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.promoteMember,
        );
        router.delete(
          "/:id/members/:memberId",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "Remove a member from the organization",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.removeMember,
        );
        router.get(
          "/:id/classes",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "List the organization's upcoming restricted classes with attendee rosters",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getClasses,
        );
        router.post(
          "/:id/invites",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "Invite teammates by email to join the organization",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.createInvites,
        );
        router.get(
          "/:id/coupon",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "Get the organization's self-pay discount coupon (any joined member)",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getCoupon,
        );
        router.get(
          "/corporate-plans",
          {
            preHandler: this.authMiddleware.handle,
            schema: {
              description: "List the corporate plan catalog for the seat-purchase flow",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getCorporatePlans,
        );
        router.post(
          "/:id/subscriptions",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "Buy a block of seats for the organization",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.createSeatPurchase,
        );
        router.post(
          "/:id/subscriptions/verify",
          {
            preHandler: [this.authMiddleware.handle, requireOrgAdmin("id")],
            schema: {
              description: "Verify payment and activate the organization's seat purchase",
              tags: ["Organizations"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.verifySeatPurchase,
        );
      },
      { prefix: "/organizations" },
    );
  }

  private getMyOrganizations = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user!;
    const data = await listOrganizationsForUser(me.id);
    const { statusCode, payload } = successResponse({
      message: "Your organizations retrieved",
      data,
    });
    return reply.status(statusCode).send(payload);
  };

  private getInvite = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: inviteTokenParamsSchema,
    });
    if (invalid) return invalid;

    const { token } = request.params as z.infer<typeof inviteTokenParamsSchema>;
    const invite = await getInviteByToken(token);
    if (!invite) {
      const { statusCode, payload } = errorResponse({
        message: "Invite not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Invite retrieved",
      data: invite,
    });
    return reply.status(statusCode).send(payload);
  };

  private acceptInvite = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: inviteTokenParamsSchema,
    });
    if (invalid) return invalid;

    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const { token } = request.params as z.infer<typeof inviteTokenParamsSchema>;
    const result = await acceptOrgInvite(token, { id: me.id, email: me.email });
    if (!result) {
      const { statusCode, payload } = errorResponse({
        message: "Invite is invalid or already used",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Joined organization",
      data: result,
    });
    return reply.status(statusCode).send(payload);
  };

  private getMembers = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const members = await listOrganizationMembers(id);

    const { statusCode, payload } = successResponse({
      message: "Organization members retrieved",
      data: members,
    });
    return reply.status(statusCode).send(payload);
  };

  private promoteMember = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: memberIdParamsSchema,
    });
    if (invalid) return invalid;

    const { id, memberId } = request.params as z.infer<typeof memberIdParamsSchema>;
    const result = await promoteOrgMember(id, memberId);

    if (!result.ok) {
      const { statusCode, payload } = errorResponse({
        message: "Member not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Member promoted to admin",
      data: { success: true as const },
    });
    return reply.status(statusCode).send(payload);
  };

  private removeMember = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: memberIdParamsSchema,
    });
    if (invalid) return invalid;

    const { id, memberId } = request.params as z.infer<typeof memberIdParamsSchema>;
    const result = await removeOrgMember(id, memberId);

    if (!result.ok) {
      const message =
        result.error === "last_admin"
          ? "Cannot remove the organization's only admin"
          : "Member not found";
      const { statusCode, payload } = errorResponse({
        message,
        statusCode: result.error === "last_admin" ? 409 : 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Member removed",
      data: { success: true as const },
    });
    return reply.status(statusCode).send(payload);
  };

  private createInvites = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: inviteMembersBodySchema,
    });
    if (invalidBody) return invalidBody;

    const me = request.user!;
    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const { emails } = request.body as z.infer<typeof inviteMembersBodySchema>;

    const organization = await getOrganizationById(id);
    if (!organization) {
      const { statusCode, payload } = errorResponse({
        message: "Organization not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const result = await inviteMembersToOrganization({
      organizationId: id,
      organizationName: organization.name,
      invitedByUserId: me.id,
      inviterName: me.name,
      emails,
    });

    const { statusCode, payload } = successResponse({
      message: "Invites sent",
      data: result,
    });
    return reply.status(statusCode).send(payload);
  };

  private getClasses = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const classes = await listOrganizationClasses(id);

    const { statusCode, payload } = successResponse({
      message: "Organization classes retrieved",
      data: classes,
    });
    return reply.status(statusCode).send(payload);
  };

  private getCoupon = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalid) return invalid;

    const me = request.user!;
    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const coupon = await getOrganizationCouponForMember(id, me.id);

    if (!coupon) {
      const { statusCode, payload } = errorResponse({
        message: "Coupon not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Coupon retrieved",
      data: { code: coupon.code, type: coupon.type, value: coupon.value },
    });
    return reply.status(statusCode).send(payload);
  };

  private getCorporatePlans = async (_request: FastifyRequest, reply: FastifyReply) => {
    const corporatePlansList = await listCorporatePlans();
    const { statusCode, payload } = successResponse({
      message: "Corporate plans retrieved",
      data: corporatePlansList,
    });
    return reply.status(statusCode).send(payload);
  };

  private createSeatPurchase = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: createSeatPurchaseBodySchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const body = request.body as z.infer<typeof createSeatPurchaseBodySchema>;
    const country = detectCountry(request, body.country);

    const result = await createOrganizationSeatPurchase({
      organizationId: id,
      corporatePlanId: body.corporatePlanId,
      seats: body.seats,
      isIndia: country === "IN",
    });

    if (!result.ok) {
      const messages: Record<typeof result.error, string> = {
        corporate_plan_not_found: "Corporate plan not found",
        no_matching_seat_tier: "No pricing tier matches this seat count",
        pricing_not_configured: "Corporate plan pricing not configured",
      };
      const { statusCode, payload } = errorResponse({
        message: messages[result.error],
        statusCode: result.error === "corporate_plan_not_found" ? 404 : 400,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Seat purchase created",
      data: {
        subscriptionId: result.subscriptionId,
        keyId: result.keyId,
        organizationSubscriptionId: result.organizationSubscriptionId,
      },
    });
    return reply.status(statusCode).send(payload);
  };

  private verifySeatPurchase = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalidParams = validateWithZod(request, reply, {
      params: organizationIdParamsSchema,
    });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, {
      body: verifySeatPurchaseBodySchema,
    });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof organizationIdParamsSchema>;
    const body = request.body as z.infer<typeof verifySeatPurchaseBodySchema>;

    const signatureValid = verifySubscriptionSignature({
      subscriptionId: body.razorpaySubscriptionId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });
    if (!signatureValid) {
      const { statusCode, payload } = errorResponse({
        message: "Invalid payment signature",
        statusCode: 400,
        error: "INVALID_SIGNATURE",
      });
      return reply.status(statusCode).send(payload);
    }

    const result = await verifyOrganizationSeatPurchase({
      organizationId: id,
      razorpaySubscriptionId: body.razorpaySubscriptionId,
    });

    if (!result.ok) {
      const { statusCode, payload } = errorResponse({
        message: result.error === "not_found" ? "Subscription not found" : "Subscription does not belong to this organization",
        statusCode: result.error === "not_found" ? 404 : 403,
      });
      return reply.status(statusCode).send(payload);
    }

    const { statusCode, payload } = successResponse({
      message: "Payment verified",
      data: { success: true as const, organizationSubscriptionId: result.organizationSubscriptionId },
    });
    return reply.status(statusCode).send(payload);
  };
}
