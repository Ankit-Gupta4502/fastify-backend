import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { YouTubeService } from "../services/youtube.service";
import {
  YouTubeValidationSchema,
  youtubeSwaggerSchemas,
} from "../validation/youtube.validation.schema";
import { accounts } from "../models/accounts.schema";
import { services } from "../models/serivces.schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "../utils";
import { config } from "../config";

export class YouTubeController {
  private youtubeService: YouTubeService;
  private youtubeSchema: YouTubeValidationSchema;

  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.youtubeService = new YouTubeService();
    this.youtubeSchema = new YouTubeValidationSchema();
    this.register(app);
  }

  register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.get(
          "/auth-url",
          {
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeAuthUrl,
          },
          this.getYouTubeAuthUrl,
        );
        router.get(
          "/callback",
          this.handleYouTubeCallback,
        );
        router.get(
          "/channel",
          {
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeChannel,
          },
          this.getYouTubeChannel,
        );
        router.get(
          "/videos",
          {
            preValidation: this.youtubeSchema.youtubeVideosQuerySchema.bind(this.youtubeSchema),
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeVideos,
          },
          this.getYouTubeVideos,
        );
        router.get(
          "/video/:videoId",
          {
            preValidation: [
              this.youtubeSchema.youtubeVideoIdParamsSchema.bind(this.youtubeSchema),
              this.youtubeSchema.youtubeVideoDetailsQuerySchema.bind(this.youtubeSchema),
            ],
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeVideoDetails,
          },
          this.getYouTubeVideoDetails,
        );
        router.get(
          "/video/:videoId/insights",
          {
            preValidation: [
              this.youtubeSchema.youtubeVideoIdParamsSchema.bind(this.youtubeSchema),
              this.youtubeSchema.youtubeVideoDetailsQuerySchema.bind(this.youtubeSchema),
            ],
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeVideoInsights,
          },
          this.getYouTubeVideoInsights,
        );
        router.get(
          "/playlists",
          {
            preValidation: this.youtubeSchema.youtubePlaylistsQuerySchema.bind(this.youtubeSchema),
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubePlaylists,
          },
          this.getYouTubePlaylists,
        );
        router.get(
          "/analytics",
          {
            preValidation: this.youtubeSchema.youtubeAnalyticsQuerySchema.bind(this.youtubeSchema),
            preHandler: this.authMiddleware.handle,
            schema: youtubeSwaggerSchemas.getYouTubeAnalytics,
          },
          this.getYouTubeAnalytics,
        );
      },
      { prefix: "/youtube" },
    );
  }

  private getAccountWithAutoRefresh = async (accountId: string, userId: string) => {
    const [account] = await this.app.drizzle
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId) && eq(accounts.userId, userId));

    if (!account || !account.accessToken) {
      throw new Error("YouTube account not connected");
    }

    let accessToken = account.accessToken;

    try {
      await this.youtubeService.validateToken(accessToken);
    } catch {
      const tokenData = await this.youtubeService.refreshToken(
        account.refreshToken!,
        config.youtube.clientId!,
        config.youtube.clientSecret!,
      );
      accessToken = tokenData.access_token;

      await this.app.drizzle
        .update(accounts)
        .set({ accessToken, updatedAt: new Date() })
        .where(eq(accounts.id, accountId));
    }

    return { ...account, accessToken: accessToken as string };
  };

  private getYouTubeAuthUrl = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { clientId, redirectUri, scopes } = config.youtube;

    if (!clientId || !redirectUri) {
      const { statusCode, payload } = errorResponse({
        message: "YouTube credentials not configured",
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }

    const userId = (req.user as { id: string }).id;
    const state = Buffer.from(JSON.stringify({ userId, nonce: Math.random().toString(36).substring(7) })).toString("base64");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes.join(" ")}&response_type=code&access_type=offline&prompt=consent`;

    const { statusCode, payload } = successResponse({
      message: "YouTube OAuth URL generated",
      data: { authUrl, state },
    });
    return res.status(statusCode).send(payload);
  };

  private handleYouTubeCallback = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { code, state } = req.query as { code: string; state: string };

    if (!code) {
      return res.redirect(`${config.frontend.url}/?error=youtube_auth_failed`);
    }

    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
    } catch {
      return res.redirect(`${config.frontend.url}/?error=invalid_state`);
    }

    const { clientId, clientSecret, redirectUri } = config.youtube;
    const frontendUrl = config.frontend.url;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.redirect(`${frontendUrl}/?error=config_missing`);
    }

    try {
      const tokenResponse = await this.youtubeService.exchangeCodeForToken(
        code,
        redirectUri,
        clientId!,
        clientSecret!,
      );

      const channel = await this.youtubeService.getChannel(tokenResponse.access_token);

      if (!channel) {
        return res.redirect(`${frontendUrl}/?error=channel_not_found`);
      }

      const [existingAccount] = await this.app.drizzle
        .select()
        .from(accounts)
        .where(eq(accounts.providerAccountId, channel.id));

      if (existingAccount) {
        await this.app.drizzle
          .update(accounts)
          .set({
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, existingAccount.id));

        return res.redirect(`${frontendUrl}/youtube/connected?accountId=${existingAccount.id}`);
      }

      let youtubeService = await this.app.drizzle
        .select()
        .from(services)
        .where(eq(services.displayName, "youtube"));

      let serviceId: string;

      if (youtubeService.length === 0) {
        const [newService] = await this.app.drizzle
          .insert(services)
          .values({ displayName: "youtube", authType: "oauth2" })
          .returning();
        serviceId = newService.id;
      } else {
        serviceId = youtubeService[0].id;
      }

      const [account] = await this.app.drizzle
        .insert(accounts)
        .values({
          userId,
          serviceId,
          providerAccountId: channel.id,
          username: channel.snippet?.customUrl || channel.snippet?.title,
          displayName: channel.snippet?.title,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          metadata: {
            uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
            subscriberCount: channel.statistics?.subscriberCount,
            viewCount: channel.statistics?.viewCount,
            videoCount: channel.statistics?.videoCount,
            thumbnail: channel.snippet?.thumbnails?.default?.url,
          },
        })
        .returning();

      return res.redirect(`${frontendUrl}/youtube/connected?accountId=${account.id}`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/?error=token_exchange_failed`);
    }
  };

  private getYouTubeChannel = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const channel = await this.youtubeService.getChannel(account.accessToken);

      const { statusCode, payload } = successResponse({
        message: "YouTube channel fetched successfully",
        data: channel,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube channel",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getYouTubeVideos = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId, playlistId, maxResults } = req.query as {
      accountId: string;
      playlistId?: string;
      maxResults?: string;
    };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const channel = await this.youtubeService.getChannel(account.accessToken);
      const uploadsPlaylistId = playlistId || channel.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        const { statusCode, payload } = errorResponse({
          message: "Uploads playlist not found",
          statusCode: 404,
        });
        return res.status(statusCode).send(payload);
      }

      const videos = await this.youtubeService.getVideos(
        account.accessToken,
        uploadsPlaylistId,
        maxResults ? parseInt(maxResults, 10) : 25,
      );

      const { statusCode, payload } = successResponse({
        message: "YouTube videos fetched successfully",
        data: videos,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube videos",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getYouTubeVideoDetails = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { videoId } = req.params as { videoId: string };
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const video = await this.youtubeService.getVideoDetails(
        videoId,
        account.accessToken,
      );

      if (!video) {
        const { statusCode, payload } = errorResponse({
          message: "Video not found",
          statusCode: 404,
        });
        return res.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "YouTube video details fetched successfully",
        data: video,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube video details",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getYouTubeVideoInsights = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { videoId } = req.params as { videoId: string };
    const { accountId } = req.query as { accountId: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const insights = await this.youtubeService.getVideoInsights(
        videoId,
        account.accessToken,
      );

      if (!insights) {
        const { statusCode, payload } = errorResponse({
          message: "Video insights not found",
          statusCode: 404,
        });
        return res.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "YouTube video insights fetched successfully",
        data: insights,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube video insights",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getYouTubePlaylists = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId, maxResults } = req.query as { accountId: string; maxResults?: string };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const playlists = await this.youtubeService.getPlaylists(
        account.accessToken,
        maxResults ? parseInt(maxResults, 10) : 25,
      );

      const { statusCode, payload } = successResponse({
        message: "YouTube playlists fetched successfully",
        data: playlists,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube playlists",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };

  private getYouTubeAnalytics = async (
    req: FastifyRequest,
    res: FastifyReply,
  ) => {
    const { accountId, startDate, endDate, metrics } = req.query as {
      accountId: string;
      startDate: string;
      endDate: string;
      metrics?: string;
    };

    try {
      const userId = (req.user as { id: string }).id;
      const account = await this.getAccountWithAutoRefresh(accountId, userId);

      const channel = await this.youtubeService.getChannel(account.accessToken);

      if (!channel?.id) {
        const { statusCode, payload } = errorResponse({
          message: "Channel not found",
          statusCode: 404,
        });
        return res.status(statusCode).send(payload);
      }

      const analytics = await this.youtubeService.getAnalytics(
        account.accessToken,
        channel.id,
        startDate,
        endDate,
        metrics,
      );

      const { statusCode, payload } = successResponse({
        message: "YouTube analytics fetched successfully",
        data: analytics,
      });
      return res.status(statusCode).send(payload);
    } catch (error: any) {
      const { statusCode, payload } = errorResponse({
        message: "Failed to fetch YouTube analytics",
        error: error.message,
        statusCode: 500,
      });
      return res.status(statusCode).send(payload);
    }
  };
}
