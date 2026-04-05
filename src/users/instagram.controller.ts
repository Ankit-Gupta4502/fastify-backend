import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { InstagramService } from "../services/instagram.service";
import {
  ServicesValidationSchema,
  servicesSwaggerSchemas,
} from "./services.validation.schema";
import { accounts } from "../models/accounts.schema";
import { services } from "../models/serivces.schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse, encodeJWT } from "../utils";
import { config } from "../config";

export class InstagramController {
  private instagramService: InstagramService;
  private schema: ServicesValidationSchema;

  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.instagramService = new InstagramService();
    this.schema = new ServicesValidationSchema();
    this.register(app);
  }

  register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.get(
          "/auth-url",
          {
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramAuthUrl,
          },
          this.getInstagramAuthUrl,
        );
        router.get(
          "/callback",
          this.handleInstagramCallback,
        );
        router.get(
          "/profile",
          {
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramProfile,
          },
          this.getInstagramProfile,
        );
        router.get(
          "/media",
          {
            preValidation: this.schema.instagramMediaSchema.bind(this.schema),
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramMedia,
          },
          this.getInstagramMedia,
        );
        router.get(
          "/reels",
          {
            preValidation: this.schema.instagramReelsSchema.bind(this.schema),
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramReels,
          },
          this.getInstagramReels,
        );
        router.get(
          "/post/:mediaId",
          {
            preValidation: [
              this.schema.instagramPostParamsSchema.bind(this.schema),
              this.schema.instagramPostQuerySchema.bind(this.schema),
            ],
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramPost,
          },
          this.getInstagramPost,
        );
        router.get(
          "/post/:mediaId/insights",
          {
            preValidation: [
              this.schema.instagramPostParamsSchema.bind(this.schema),
              this.schema.instagramPostQuerySchema.bind(this.schema),
            ],
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramPostInsights,
          },
          this.getInstagramPostInsights,
        );
        router.get(
          "/statistics",
          {
            preValidation: this.schema.instagramStatisticsSchema.bind(this.schema),
            preHandler: this.authMiddleware.handle,
            schema: servicesSwaggerSchemas.getInstagramAccountStatistics,
          },
          this.getInstagramAccountStatistics,
        );
      },
      { prefix: "/instagram" },
    );
  }

  private getAccountWithAutoRefresh = async (accountId: string, userId: string) => {
    const [account] = await this.app.drizzle
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId) && eq(accounts.userId, userId));

    if (!account || !account.accessToken) {
      throw new Error("Instagram account not connected");
    }

    let accessToken = account.accessToken;

    try {
      await this.instagramService.validateToken(accessToken);
    } catch {
      const tokenData = await this.instagramService.refreshToken(accessToken);
      accessToken = tokenData.access_token;

      await this.app.drizzle
        .update(accounts)
        .set({ accessToken, updatedAt: new Date() })
        .where(eq(accounts.id, accountId));
    }

    return { ...account, accessToken: accessToken as string };
  };

  private getInstagramAuthUrl = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { clientId, redirectUri, scopes } = config.instagram;

    if (!clientId || !redirectUri) {
      const { statusCode, payload } = errorResponse({
        message: "Instagram credentials not configured",
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }

    const userId = (req.user as { id: string }).id;
    const state = Buffer.from(JSON.stringify({ userId, nonce: Math.random().toString(36).substring(7) })).toString("base64");

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes.join(",")}&response_type=code`;

    const { statusCode, payload } = successResponse({
      message: "Instagram OAuth URL generated",
      data: { authUrl, state },
    });
    return res.status(statusCode).send(payload);
  };

  private handleInstagramCallback = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { code, state } = req.query as { code: string; state: string };

    if (!code) {
      return res.redirect(`${config.frontend.url}/?error=instagram_auth_failed`);
    }

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return res.redirect(`${config.frontend.url}/?error=invalid_state`);
    }

    const { clientId, clientSecret, redirectUri } = config.instagram;
    const frontendUrl = config.frontend.url;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.redirect(`${frontendUrl}/?error=config_missing`);
    }

    try {
      const tokenResponse = await this.instagramService.exchangeCodeForToken(
        code,
        redirectUri,
        clientId!,
        clientSecret!,
      );

      const profile = await this.instagramService.getUserProfile(tokenResponse.access_token);

      const [existingAccount] = await this.app.drizzle
        .select()
        .from(accounts)
        .where(eq(accounts.providerAccountId, profile.id));

      if (existingAccount) {
        await this.app.drizzle
          .update(accounts)
          .set({
            accessToken: tokenResponse.access_token,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, existingAccount.id));

        return res.redirect(`${frontendUrl}/instagram/connected?accountId=${existingAccount.id}`);
      }

      let instagramService = await this.app.drizzle
        .select()
        .from(services)
        .where(eq(services.displayName, "instagram"));

      let serviceId: string;

      if (instagramService.length === 0) {
        const [newService] = await this.app.drizzle
          .insert(services)
          .values({ displayName: "instagram", authType: "oauth2" })
          .returning();
        serviceId = newService.id;
      } else {
        serviceId = instagramService[0].id;
      }

      const [account] = await this.app.drizzle
        .insert(accounts)
        .values({
          userId,
          serviceId,
          providerAccountId: profile.id,
          username: profile.username,
          displayName: profile.username,
          accessToken: tokenResponse.access_token,
          metadata: {
            account_type: profile.account_type,
            media_count: profile.media_count,
          },
        })
        .returning();

      return res.redirect(`${frontendUrl}/instagram/connected?accountId=${account.id}`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/?error=token_exchange_failed`);
    }
  };

  private getInstagramProfile = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const profile = await this.instagramService.getUserProfile(account.accessToken);

      const { statusCode, payload } = successResponse({
        message: "Instagram profile fetched successfully",
        data: profile,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram profile",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getInstagramMedia = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId, limit } = req.query as { accountId: string; limit?: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const media = await this.instagramService.getUserMedia(
        account.accessToken,
        undefined,
        limit ? parseInt(limit, 10) : 25,
      );

      const { statusCode, payload } = successResponse({
        message: "Instagram media fetched successfully",
        data: media,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram media",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getInstagramReels = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId, limit } = req.query as { accountId: string; limit?: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const reels = await this.instagramService.getUserReels(
        account.accessToken,
        undefined,
        limit ? parseInt(limit, 10) : 25,
      );

      const reelsOnly = reels.data?.filter(
        (item: any) => item.media_type === "REELS",
      ) || [];

      const { statusCode, payload } = successResponse({
        message: "Instagram reels fetched successfully",
        data: { ...reels, data: reelsOnly },
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram reels",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getInstagramPost = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { mediaId } = req.params as { mediaId: string };
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const post = await this.instagramService.getSingleMedia(
        mediaId,
        account.accessToken,
      );

      const { statusCode, payload } = successResponse({
        message: "Instagram post fetched successfully",
        data: post,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram post",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getInstagramPostInsights = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { mediaId } = req.params as { mediaId: string };
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const insights = await this.instagramService.getMediaInsights(
        mediaId,
        account.accessToken,
      );

      const { statusCode, payload } = successResponse({
        message: "Instagram post insights fetched successfully",
        data: insights,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram post insights",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getInstagramAccountStatistics = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const profile = await this.instagramService.getUserProfile(
        account.accessToken,
      );

      const media = await this.instagramService.getUserMedia(
        account.accessToken,
        "id,media_type,like_count,comments_count,video_views,timestamp",
        100,
      );

      const totalLikes = media.data?.reduce(
        (sum: number, item: any) => sum + (item.like_count || 0),
        0,
      ) || 0;

      const totalComments = media.data?.reduce(
        (sum: number, item: any) => sum + (item.comments_count || 0),
        0,
      ) || 0;

      const totalViews = media.data?.reduce(
        (sum: number, item: any) => sum + (item.video_views || 0),
        0,
      ) || 0;

      const reels = media.data?.filter(
        (item: any) => item.media_type === "REELS",
      ) || [];

      const images = media.data?.filter(
        (item: any) => item.media_type === "IMAGE",
      ) || [];

      const videos = media.data?.filter(
        (item: any) => item.media_type === "VIDEO",
      ) || [];

      const statistics = {
        profile: {
          username: profile.username,
          followers: profile.media_count,
          totalPosts: media.data?.length || 0,
        },
        engagement: {
          totalLikes,
          totalComments,
          totalViews,
          averageLikes: media.data?.length ? Math.round(totalLikes / media.data.length) : 0,
          averageComments: media.data?.length ? Math.round(totalComments / media.data.length) : 0,
        },
        mediaBreakdown: {
          reels: reels.length,
          images: images.length,
          videos: videos.length,
        },
      };

      const { statusCode, payload } = successResponse({
        message: "Instagram statistics fetched successfully",
        data: statistics,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch Instagram statistics",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };
}
