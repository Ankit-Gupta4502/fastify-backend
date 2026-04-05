import { z } from "zod";
import { validateWithZod } from "../utils";
import { FastifyReply, FastifyRequest } from "fastify";

export class YouTubeValidationSchema {
  public async youtubeVideosQuerySchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
      playlistId: z.string().optional(),
      maxResults: z.string().optional(),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async youtubeVideoDetailsQuerySchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async youtubePlaylistsQuerySchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
      maxResults: z.string().optional(),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async youtubeAnalyticsQuerySchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      metrics: z.string().optional(),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async youtubeVideoIdParamsSchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      videoId: z.string().min(1, "Video ID is required"),
    });
    return validateWithZod(req, reply, { params: schema });
  }
}

export const youtubeSwaggerSchemas = {
  getYouTubeAuthUrl: {
    description: "Get YouTube OAuth authorization URL",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        description: "YouTube OAuth URL generated",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              authUrl: { type: "string" as const },
              state: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubeChannel: {
    description: "Get YouTube channel details for connected account",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
      },
    },
    response: {
      200: {
        description: "YouTube channel fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              snippet: { type: "object" as const },
              statistics: { type: "object" as const },
              contentDetails: { type: "object" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubeVideos: {
    description: "Get YouTube videos for connected account",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
        playlistId: { type: "string" as const, description: "Playlist ID (default: uploads playlist)" },
        maxResults: { type: "string" as const, description: "Number of videos to fetch (default: 25)" },
      },
    },
    response: {
      200: {
        description: "YouTube videos fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              items: {
                type: "array" as const,
                items: { type: "object" as const },
              },
              nextPageToken: { type: "string" as const },
              pageInfo: { type: "object" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubeVideoDetails: {
    description: "Get details of a single YouTube video",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["videoId"],
      properties: {
        videoId: { type: "string" as const },
      },
    },
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
      },
    },
    response: {
      200: {
        description: "YouTube video details fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              snippet: { type: "object" as const },
              contentDetails: { type: "object" as const },
              statistics: { type: "object" as const },
              status: { type: "object" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubeVideoInsights: {
    description: "Get analytics insights for a YouTube video",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["videoId"],
      properties: {
        videoId: { type: "string" as const },
      },
    },
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
      },
    },
    response: {
      200: {
        description: "YouTube video insights fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              viewCount: { type: "string" as const },
              likeCount: { type: "string" as const },
              commentCount: { type: "string" as const },
              favoriteCount: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubePlaylists: {
    description: "Get YouTube playlists for connected account",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
        maxResults: { type: "string" as const, description: "Number of playlists to fetch (default: 25)" },
      },
    },
    response: {
      200: {
        description: "YouTube playlists fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              items: {
                type: "array" as const,
                items: { type: "object" as const },
              },
              nextPageToken: { type: "string" as const },
              pageInfo: { type: "object" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getYouTubeAnalytics: {
    description: "Get YouTube channel analytics",
    tags: ["YouTube"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId", "startDate", "endDate"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
        startDate: { type: "string" as const, format: "date", description: "Start date (YYYY-MM-DD)" },
        endDate: { type: "string" as const, format: "date", description: "End date (YYYY-MM-DD)" },
        metrics: { type: "string" as const, description: "Comma-separated metrics" },
      },
    },
    response: {
      200: {
        description: "YouTube analytics fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              columnHeaders: {
                type: "array" as const,
                items: { type: "object" as const },
              },
              rows: {
                type: "array" as const,
                items: { type: "array" as const },
              },
              kind: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
};
