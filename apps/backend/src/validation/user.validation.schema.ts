export const userSwaggerSchemas = {
  getUserDetail: {
    description: "Get authenticated user details",
    tags: ["User"] as string[],
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        description: "User details",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              name: { type: "string" as const },
              email: { type: "string" as const },
              role: {
                type: "string" as const,
                enum: ["user", "instructor", "admin"],
              },
              emailVerified: { type: "boolean" as const },
              image: { type: "string" as const, nullable: true },
              createdAt: { type: "string" as const },
              updatedAt: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      401: {
        description: "Unauthorized",
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
};
