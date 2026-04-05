import { z } from "zod";
import { validateWithZod } from "../utils";
import { FastifyReply, FastifyRequest } from "fastify";

export class ServicesValidationSchema {
  public async instagramMediaSchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
      limit: z.string().optional(),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async instagramReelsSchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
      limit: z.string().optional(),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async instagramPostParamsSchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      mediaId: z.string().min(1, "Media ID is required"),
    });
    return validateWithZod(req, reply, { params: schema });
  }

  public async instagramPostQuerySchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
    });
    return validateWithZod(req, reply, { query: schema });
  }

  public async instagramStatisticsSchema(req: FastifyRequest, reply: FastifyReply) {
    const schema = z.object({
      accountId: z.string().uuid("Invalid account ID"),
    });
    return validateWithZod(req, reply, { query: schema });
  }
}

export const servicesSwaggerSchemas = {
  getInstagramAuthUrl: {
    description: "Get Instagram OAuth authorization URL",
    tags: ["Instagram"] as string[],
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        description: "Instagram OAuth URL generated",
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
  getInstagramProfile: {
    description: "Get Instagram profile for connected account",
    tags: ["Instagram"] as string[],
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
        description: "Instagram profile fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              username: { type: "string" as const },
              account_type: { type: "string" as const },
              media_count: { type: "number" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      500: {
        description: "Failed to fetch profile",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: { type: "null" as const },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getInstagramMedia: {
    description: "Get Instagram media posts for connected account",
    tags: ["Instagram"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
        limit: { type: "string" as const, description: "Number of posts to fetch (default: 25)" },
      },
    },
    response: {
      200: {
        description: "Instagram media fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              data: {
                type: "array" as const,
                items: { type: "object" as const },
              },
              paging: { type: "object" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getInstagramReels: {
    description: "Get Instagram reels for connected account",
    tags: ["Instagram"] as string[],
    security: [{ cookieAuth: [] }],
    querystring: {
      type: "object" as const,
      required: ["accountId"],
      properties: {
        accountId: { type: "string" as const, format: "uuid" },
        limit: { type: "string" as const, description: "Number of reels to fetch (default: 25)" },
      },
    },
    response: {
      200: {
        description: "Instagram reels fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              data: {
                type: "array" as const,
                items: { type: "object" as const },
              },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getInstagramPost: {
    description: "Get a single Instagram post by ID",
    tags: ["Instagram"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["mediaId"],
      properties: {
        mediaId: { type: "string" as const },
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
        description: "Instagram post fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              caption: { type: "string" as const },
              media_type: { type: "string" as const },
              media_url: { type: "string" as const },
              permalink: { type: "string" as const },
              timestamp: { type: "string" as const },
              like_count: { type: "number" as const },
              comments_count: { type: "number" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getInstagramPostInsights: {
    description: "Get Instagram post insights (analytics)",
    tags: ["Instagram"] as string[],
    security: [{ cookieAuth: [] }],
    params: {
      type: "object" as const,
      required: ["mediaId"],
      properties: {
        mediaId: { type: "string" as const },
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
        description: "Instagram post insights fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              data: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    name: { type: "string" as const },
                    values: { type: "array" as const },
                    title: { type: "string" as const },
                    description: { type: "string" as const },
                  },
                },
              },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getInstagramAccountStatistics: {
    description: "Get Instagram account statistics and analytics",
    tags: ["Instagram"] as string[],
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
        description: "Instagram statistics fetched successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              profile: {
                type: "object" as const,
                properties: {
                  username: { type: "string" as const },
                  followers: { type: "number" as const },
                  totalPosts: { type: "number" as const },
                },
              },
              engagement: {
                type: "object" as const,
                properties: {
                  totalLikes: { type: "number" as const },
                  totalComments: { type: "number" as const },
                  totalViews: { type: "number" as const },
                  averageLikes: { type: "number" as const },
                  averageComments: { type: "number" as const },
                },
              },
              mediaBreakdown: {
                type: "object" as const,
                properties: {
                  reels: { type: "number" as const },
                  images: { type: "number" as const },
                  videos: { type: "number" as const },
                },
              },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
};
