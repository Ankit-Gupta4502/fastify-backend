export {
  loginBodySchema,
  registerBodySchema,
  socialCallbackQuerySchema,
} from "@yoga-app/shared";

export const authSwaggerSchemas = {
  register: {
    description: "Register a new user with email and password",
    tags: ["Auth"] as string[],
    body: {
      type: "object" as const,
      required: ["name", "email", "password"],
      properties: {
        name: { type: "string" as const },
        email: { type: "string" as const, format: "email" },
        password: { type: "string" as const, minLength: 8 },
      },
    },
  },
  login: {
    description: "Sign in with email and password",
    tags: ["Auth"] as string[],
    body: {
      type: "object" as const,
      required: ["email", "password"],
      properties: {
        email: { type: "string" as const, format: "email" },
        password: { type: "string" as const },
        rememberMe: { type: "boolean" as const },
      },
    },
  },
  logout: {
    description: "Sign out the current session",
    tags: ["Auth"] as string[],
    security: [{ cookieAuth: [] }],
  },
  session: {
    description: "Get the current authenticated session",
    tags: ["Auth"] as string[],
    security: [{ cookieAuth: [] }],
  },
  googleLogin: {
    description: "Start Google OAuth sign-in (redirects to Google)",
    tags: ["Auth"] as string[],
    querystring: {
      type: "object" as const,
      properties: {
        callbackURL: {
          type: "string" as const,
          description: "Frontend URL to return to after sign-in",
        },
      },
    },
  },
};
