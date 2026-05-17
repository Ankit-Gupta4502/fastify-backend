import { fromNodeHeaders } from "better-auth/node";
import { APIError } from "@better-auth/core/error";
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../../lib/auth";
import { applyAuthResponseHeaders } from "../../lib/auth-cookies";
import { config } from "../../config";
import { drizzle } from "../../db";
import { user } from "../../schema/schema";
import {
  authSwaggerSchemas,
  loginBodySchema,
  registerBodySchema,
  socialCallbackQuerySchema,
} from "../../validation/auth.validation.schema";
import {
  errorResponse,
  successResponse,
  validateWithZod,
} from "../../utils";
import { logger } from "better-auth";

export class AuthController {
  constructor(private readonly app: FastifyInstance) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.post(
          "/register",
          { schema: authSwaggerSchemas.register },
          this.registerUser,
        );
        router.post(
          "/login",
          { schema: authSwaggerSchemas.login },
          this.loginUser,
        );
        router.post(
          "/logout",
          { schema: authSwaggerSchemas.logout },
          this.logoutUser,
        );
        router.get(
          "/session",
          { schema: authSwaggerSchemas.session },
          this.getSession,
        );
        router.get(
          "/google",
          { schema: authSwaggerSchemas.googleLogin },
          this.googleLogin,
        );
      },
      { prefix: "/auth" },
    );
  }

  private registerUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      body: registerBodySchema,
    });
    if (invalid) {
      return invalid;
    }

    const body = request.body as z.infer<typeof registerBodySchema>;

    try {
      const { headers, response: data } = await auth.api.signUpEmail({
        body,
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      applyAuthResponseHeaders(reply, headers);

      const { statusCode, payload } = successResponse({
        message: "Registration successful",
        data,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      return this.handleAuthError(error, reply);
    }
  };

  private loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, {
      body: loginBodySchema,
    });
    if (invalid) {
      return invalid;
    }

    const body = request.body as z.infer<typeof loginBodySchema>;

    try {
      const existingUser = await drizzle.query.user.findFirst({
        where: eq(user.email, body.email),
      });

      if (!existingUser) {
        const { statusCode, payload } = errorResponse({
          message: "Invalid email or password",
          statusCode: 401,
        });
        return reply.status(statusCode).send(payload);
      }

      if (existingUser.role !== body.role) {
        const { statusCode, payload } = errorResponse({
          message: `This account is registered as ${existingUser.role}. Choose the matching role to sign in.`,
          statusCode: 403,
        });
        return reply.status(statusCode).send(payload);
      }

      const { headers, response: data } = await auth.api.signInEmail({
        body: {
          email: body.email,
          password: body.password,
          rememberMe: body.rememberMe,
        },
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      applyAuthResponseHeaders(reply, headers);

      const { statusCode, payload } = successResponse({
        message: "Login successful",
        data,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      return this.handleAuthError(error, reply);
    }
  };

  private logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await auth.api.signOut({
        headers: fromNodeHeaders(request.headers),
        asResponse: true,
      });

      applyAuthResponseHeaders(reply, response.headers);

      const { statusCode, payload } = successResponse({
        message: "Logged out successfully",
        data: { success: true },
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      return this.handleAuthError(error, reply);
    }
  };

  private getSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        const { statusCode, payload } = errorResponse({
          message: "Not authenticated",
          statusCode: 401,
        });
        return reply.status(statusCode).send(payload);
      }

      const { statusCode, payload } = successResponse({
        message: "Session retrieved",
        data: session,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      return this.handleAuthError(error, reply);
    }
  };

  private googleLogin = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const { statusCode, payload } = errorResponse({
        message: "Google sign-in is not configured",
        statusCode: 503,
      });
      return reply.status(statusCode).send(payload);
    }

    const invalid = validateWithZod(request, reply, {
      query: socialCallbackQuerySchema,
    });
    if (invalid) {
      return invalid;
    }

    const query = request.query as z.infer<typeof socialCallbackQuerySchema>;
    const callbackURL = query.callbackURL ?? config.frontend.url;

    try {
      const { response, headers } = await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL,
        },
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      applyAuthResponseHeaders(reply, headers);

      if (response.url) {
        return reply.redirect(response.url);
      }

      const { statusCode, payload } = successResponse({
        message: "Google sign-in initiated",
        data: response,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      console.info(error);
      
      return this.handleAuthError(error, reply);
    }
  };

  private handleAuthError(error: unknown, reply: FastifyReply) {
    if (error instanceof APIError) {
      const apiError = error as {
        statusCode: number;
        body?: { message?: string; code?: string };
      };
      const { statusCode, payload } = errorResponse({
        message: apiError.body?.message ?? "Authentication failed",
        statusCode: apiError.statusCode,
        error: apiError.body?.code ?? null,
      });
      return reply.status(statusCode).send(payload);
    }

    throw error;
  }
}
