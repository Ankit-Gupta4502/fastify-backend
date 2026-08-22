import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { getReferralDashboard } from "../../services/referral.service";
import { errorResponse, successResponse } from "../../utils";

export class ReferralController {
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
              description:
                "Get the current user's referral code, link, and referred users",
              tags: ["Referrals"] as string[],
              security: [{ cookieAuth: [] }],
            },
          },
          this.getMyReferrals,
        );
      },
      { prefix: "/referrals" },
    );
  }

  private getMyReferrals = async (request: FastifyRequest, reply: FastifyReply) => {
    const me = request.user;
    if (!me) {
      const { statusCode, payload } = errorResponse({ message: "Unauthorized", statusCode: 401 });
      return reply.status(statusCode).send(payload);
    }

    const dashboard = await getReferralDashboard(me.id);

    const { statusCode, payload } = successResponse({
      message: "Referral summary retrieved",
      data: dashboard,
    });
    return reply.status(statusCode).send(payload);
  };
}
