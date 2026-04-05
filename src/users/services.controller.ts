import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { InstagramController } from "./instagram.controller";
import { YouTubeController } from "./youtube.controller";
import { config } from "../config";
import { accounts } from "../models/accounts.schema";
import { services } from "../models/serivces.schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "../utils";

export class ServicesController {
  private instagramController: InstagramController;
  private youtubeController: YouTubeController;

  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.app = app;
    this.instagramController = new InstagramController(authMiddleware, app);
    this.youtubeController = new YouTubeController(authMiddleware, app);
    this.register(app);
  }

  register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.register(this.instagramController.register.bind(this.instagramController));
        router.register(this.youtubeController.register.bind(this.youtubeController));

        router.get(
          "/accounts/:serviceName",
          { preHandler: this.authMiddleware.handle },
          this.getAccountsByService,
        );
      },
      { prefix: "/services" },
    );
  }

  private getAccountsByService = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { serviceName } = req.params as { serviceName: string };

    try {
      const userId = (req.user as { id: string }).id;

      const [service] = await this.app.drizzle
        .select()
        .from(services)
        .where(eq(services.displayName, serviceName));

      if (!service) {
        const { statusCode, payload } = successResponse({
          message: `No ${serviceName} accounts connected`,
          data: [],
        });
        return res.status(statusCode).send(payload);
      }

      const userAccounts = await this.app.drizzle
        .select({
          id: accounts.id,
          providerAccountId: accounts.providerAccountId,
          username: accounts.username,
          displayName: accounts.displayName,
          createdAt: accounts.createdAt,
          updatedAt: accounts.updatedAt,
          metadata: accounts.metadata,
        })
        .from(accounts)
        .where(eq(accounts.userId, userId) && eq(accounts.serviceId, service.id));

      const { statusCode, payload } = successResponse({
        message: `${serviceName} accounts fetched successfully`,
        data: userAccounts,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: `Failed to fetch ${serviceName} accounts`,
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };
}

export { config };
