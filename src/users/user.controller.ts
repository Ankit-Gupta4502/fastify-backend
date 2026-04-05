import { AuthMiddleware } from "../middleware/auth.middleware";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UserValidationSchema, userSwaggerSchemas } from "../validation/user.validation.schema";
import { eq } from "drizzle-orm";
import {
  encodeJWT,
  generate4DigitOTP,
  hashPassword,
  comparePassword,
  successResponse,
  errorResponse,
} from "../utils";
import { otpTable } from "../models/otp.schema";
import { usersTable } from "../models/user.schema";

export class UserController {
  private schema: UserValidationSchema;

  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance
  ) {
    this.schema = new UserValidationSchema();
    this.app = app;
    this.register(app)
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.post(
          "/sign-in",
          {
            preValidation: this.schema.signInUserSchema.bind(this.schema),
            schema: userSwaggerSchemas.signIn,
          },
          this.signIn
        );

        router.post(
          "/sign-up",
          {
            preValidation: this.schema.signUpUserSchema.bind(this.schema),
            schema: userSwaggerSchemas.signUp,
          },
          this.signUp
        );

        router.get(
          "/detail",
          {
            preHandler: this.authMiddleware.handle,
            schema: userSwaggerSchemas.getUserDetail,
          },
          this.getUserDetail
        );

        router.post(
          "/send-email",
          {
            preValidation: this.schema.sendOtpSchema.bind(this.schema),
            schema: userSwaggerSchemas.sendEmail,
          },
          this.sendEmail
        );
      },
      {
        prefix: "/user",
      }
    );
  }

  private signInWithGoogle = async () => {};

  private getUser = async (id: string) => {
    const user = await this.app.drizzle.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      with: {
        accounts: {
          with: {
            service: true,
          },
        },
      },
    });
    return user;
  };

  private getUserDetail = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const payload = request.user;
    const user = await this.getUser(payload?.id!);
    if (!user) {
      const { statusCode, payload: body } = errorResponse({
        message: "User not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(body);
    }
    const { password: _, ...userWithoutPassword } = user;
    const { statusCode, payload: body } = successResponse({
      message: "User details fetched successfully",
      data: userWithoutPassword,
    });
    return reply.status(statusCode).send(body);
  };

  private sendEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string };
    const random = generate4DigitOTP();
    await this.app.drizzle.insert(otpTable).values({
      email: email,
      code: random,
    });
    const responseData = {
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV === "development" && { otp: random }),
    };
    const { statusCode, payload: body } = successResponse({
      message: "OTP sent successfully",
      data: responseData,
    });
    return reply.status(statusCode).send(body);
  };

  private signIn = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    const user = await this.app.drizzle.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (!user) {
      const { statusCode, payload: body } = errorResponse({
        message: "Invalid email or password",
        statusCode: 422,
      });
      return reply.status(statusCode).send(body);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const { statusCode, payload: body } = errorResponse({
        message: "Please enter correct password",
        statusCode: 422,
      });
      return reply.status(statusCode).send(body);
    }

    const token = await encodeJWT(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      "7d"
    );
    reply.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * (24 * 7),
    });
    const { password: _, ...userWithoutPassword } = user;
    const { statusCode, payload: body } = successResponse({
      message: "Login successful",
      data: userWithoutPassword,
    });
    return reply.status(statusCode).send(body);
  };

  private signUp = async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      name,
      email,
      phone,
      password,
      otp: recivedOtp,
    } = request.body as {
      name: string;
      email: string;
      phone: string;
      password: string;
      otp: string;
    };

    const isEmailExist = await this.app.drizzle.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (isEmailExist) {
      const { statusCode, payload: body } = errorResponse({
        message: "Email already exists",
        statusCode: 422,
      });
      return reply.status(statusCode).send(body);
    }

    const isOtpValid = await this.app.drizzle.query.otpTable.findFirst({
      where: (otp, { eq, and }) =>
        and(
          eq(otp.email, email),
          eq(otp.isUsed, false),
          eq(otp.code, recivedOtp)
        ),
    });

    if (!isOtpValid) {
      const { statusCode, payload: body } = errorResponse({
        message: "Invalid OTP code either used or expired",
        statusCode: 422,
      });
      return reply.status(statusCode).send(body);
    }
    const hashedPassword = await hashPassword(password);
    const [user] = await this.app.drizzle
      .insert(usersTable)
      .values({
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
      })
      .returning();
    await this.app.drizzle
      .update(otpTable)
      .set({ isUsed: true })
      .where(eq(otpTable.email, email));

    const encode = await encodeJWT(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      "7d"
    );
    reply.cookie("token", encode, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * (24 * 7),
    });

    const { password: _, ...userWithoutPassword } = user;
    const { statusCode, payload: body } = successResponse({
      message: "Sign up successful",
      data: userWithoutPassword,
    });
    return reply.status(statusCode).send(body);
  };
}
