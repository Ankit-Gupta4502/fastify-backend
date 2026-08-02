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
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationEmailSchema,
  verifyEmailSchema,
} from "../../validation/auth.validation.schema";
import { USER_ROLES } from "../../constants/roles";
import { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE_SECONDS } from "../../constants/referral";
import {
  PENDING_ORG_COOKIE_NAME,
  PENDING_ORG_COOKIE_MAX_AGE_SECONDS,
  PENDING_ORG_INVITE_COOKIE_NAME,
  PENDING_ORG_INVITE_COOKIE_MAX_AGE_SECONDS,
} from "../../constants/organization";
import {
  errorResponse,
  successResponse,
  validateWithZod,
} from "../../utils";
import { logger } from "better-auth";
import {
  ensureReferralCode,
  resolveReferrerByCode,
} from "../../services/referral.service";
import {
  acceptOrgInvite,
  createOrganizationForUser,
} from "../../services/organization.service";

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
        router.post(
          "/forgot-password",
          { schema: authSwaggerSchemas.forgotPassword },
          this.forgotPassword,
        );
        router.post(
          "/reset-password",
          { schema: authSwaggerSchemas.resetPassword },
          this.resetPassword,
        );
        router.post(
          "/resend-verification-email",
          { schema: authSwaggerSchemas.resendVerificationEmail },
          this.resendVerificationEmail,
        );
        router.post(
          "/verify-email",
          { schema: authSwaggerSchemas.verifyEmail },
          this.verifyEmail,
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

    let referredByUserId: string | undefined;
    if (body.referralCode) {
      const referrer = await resolveReferrerByCode(body.referralCode);
      if (referrer) {
        referredByUserId = referrer.id;
      } else {
        request.log.warn(
          { referralCode: body.referralCode },
          "register: referral code did not match any user — continuing without referral",
        );
      }
    }

    try {
      const { headers, response: data } = await auth.api.signUpEmail({
        body: { ...body, role: USER_ROLES.USER, referredByUserId },
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      applyAuthResponseHeaders(reply, headers);

      const newUser = await drizzle.query.user.findFirst({
        where: eq(user.email, body.email),
      });
      if (newUser) {
        await ensureReferralCode(newUser.id);

        if (body.organization) {
          await createOrganizationForUser({
            createdByUserId: newUser.id,
            createdByEmail: newUser.email,
            name: body.organization.name,
            sizeBand: body.organization.sizeBand,
          });
        } else if (body.orgInviteToken) {
          await acceptOrgInvite(body.orgInviteToken, {
            id: newUser.id,
            email: newUser.email,
          });
        }
      }

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

      // Email verification is only enforced for role=USER — instructor/admin
      // accounts are created out-of-band and shouldn't be gated by this.
      if (existingUser.role === USER_ROLES.USER && !existingUser.emailVerified) {
        try {
          await auth.api.sendVerificationEmail({
            body: { email: existingUser.email },
            headers: fromNodeHeaders(request.headers),
          });
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[loginUser] sendVerificationEmail threw:", err);
          }
        }

        const { statusCode, payload } = errorResponse({
          message: "Email not verified",
          statusCode: 403,
          error: "EMAIL_NOT_VERIFIED",
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

    // Fetch Metadata: a same-origin/same-site request either omits this header
    // (older browsers) or sends same-origin/same-site/none. "cross-site" means
    // the request was triggered by a third-party page (e.g. an <img> pixel) —
    // refuse to plant the referral cookie in that case, since Set-Cookie is
    // honored regardless of CORS and SameSite=Lax doesn't block being *set*.
    const isCrossSite = request.headers["sec-fetch-site"] === "cross-site";

    if (query.ref && !isCrossSite) {
      // Read back in the `user.create` databaseHook (lib/auth.ts) once Google
      // redirects back here and the new account is about to be inserted —
      // the referral code can't otherwise survive that redirect round trip.
      reply.setCookie(REFERRAL_COOKIE_NAME, query.ref, {
        path: "/",
        maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    if (query.orgName && query.orgSizeBand && !isCrossSite) {
      // Same round-trip problem as the referral cookie above — "sign up as a
      // company" details are read back in the `user.create.after` databaseHook
      // (lib/auth.ts) once the new user row actually exists.
      reply.setCookie(
        PENDING_ORG_COOKIE_NAME,
        JSON.stringify({ name: query.orgName, sizeBand: query.orgSizeBand }),
        {
          path: "/",
          maxAge: PENDING_ORG_COOKIE_MAX_AGE_SECONDS,
          httpOnly: true,
          sameSite: "lax",
        },
      );
    } else if (query.orgInviteToken && !isCrossSite) {
      // Same mechanism, for a NEW user accepting an org invite instead of
      // creating an org — mutually exclusive with the branch above.
      reply.setCookie(PENDING_ORG_INVITE_COOKIE_NAME, query.orgInviteToken, {
        path: "/",
        maxAge: PENDING_ORG_INVITE_COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    try {
      const { response, headers } = await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL,
        },
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      console.log("SIGN_IN_SOCIAL RESULT");
      console.dir(response, { depth: null });

      applyAuthResponseHeaders(reply, headers);

      const { statusCode, payload } = successResponse({
        message: "Google sign-in initiated",
        data: { url: response.url ?? null },
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      console.info(error);
      
      return this.handleAuthError(error, reply);
    }
  };

  private forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: forgotPasswordSchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof forgotPasswordSchema>;

    try {
      const result = await auth.api.requestPasswordReset({
        body: {
          email: body.email,
          redirectTo: `${config.frontend.url}/reset-password`,
        },
        headers: fromNodeHeaders(request.headers),
      });
      // better-auth returns error objects rather than always throwing
      if (result && typeof result === "object" && "error" in result && result.error) {
        console.error("[forgotPassword] better-auth error:", result.error);
      }
    } catch (err) {
      // Log in dev so we can diagnose failures; never expose to client
      if (process.env.NODE_ENV !== "production") {
        console.error("[forgotPassword] requestPasswordReset threw:", err);
      }
    }

    const { statusCode, payload } = successResponse({
      message: "If an account with that email exists, a reset link has been sent.",
      data: null,
    });
    return reply.status(statusCode).send(payload);
  };

  private resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: resetPasswordSchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof resetPasswordSchema>;

    try {
      await auth.api.resetPassword({
        body: { newPassword: body.newPassword, token: body.token },
        headers: fromNodeHeaders(request.headers),
      });

      const { statusCode, payload } = successResponse({
        message: "Password updated successfully.",
        data: null,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
      return this.handleAuthError(error, reply);
    }
  };

  private resendVerificationEmail = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, {
      body: resendVerificationEmailSchema,
    });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof resendVerificationEmailSchema>;

    try {
      await auth.api.sendVerificationEmail({
        body: { email: body.email },
        headers: fromNodeHeaders(request.headers),
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[resendVerificationEmail] sendVerificationEmail threw:", err);
      }
    }

    const { statusCode, payload } = successResponse({
      message: "If an account with that email exists, a verification link has been sent.",
      data: null,
    });
    return reply.status(statusCode).send(payload);
  };

  private verifyEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    const invalid = validateWithZod(request, reply, { body: verifyEmailSchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof verifyEmailSchema>;

    try {
      const { headers, response: data } = await auth.api.verifyEmail({
        query: { token: body.token },
        headers: fromNodeHeaders(request.headers),
        returnHeaders: true,
      });

      applyAuthResponseHeaders(reply, headers);

      const { statusCode, payload } = successResponse({
        message: "Email verified successfully",
        data,
      });
      return reply.status(statusCode).send(payload);
    } catch (error) {
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
