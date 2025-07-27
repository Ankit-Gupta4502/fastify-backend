import { AuthMiddleware } from "../middleware/auth.middleware";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UserValidationSchema } from "./user.validation.schema";
import { eq } from "drizzle-orm";
import { encodeJWT, generate4DigitOTP, hashPassword } from "../utils";
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
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.post(
          "/sign-in",
          { preValidation: this.schema.signInUserSchema },
          this.signIn
        );

        router.post(
          "/sign-up",
          { preValidation: this.schema.signUpUserSchema },
          this.signUp
        );

        router.get(
          "/detail",
          { preHandler: this.authMiddleware.handle },
          this.getUserDetail
        );

        router.post(
          "/send-email",
          { preValidation: this.schema.sendOtpSchema },
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
    });
    return user;
  };

  private getUserDetail = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const payload = request.user;
    const user = await this.getUser(payload?.id!);
    return reply
      .status(200)
      .send({ data: user || {}, message: "User details fetched successfully" });
  };

  private sendEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string; otp: string };
    const random = generate4DigitOTP();
    await this.app.drizzle.insert(otpTable).values({
      email: email,
      code: random,
    });
    return reply.status(200).send({ message: "OTP sent successfully" });
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
      return reply.status(422).send({ message: "Invalid email or password" });
    }
    if (user.password !== password) {
      return reply
        .status(422)
        .send({ message: "Please enter correct password" });
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
    return reply.status(200).send({ message: "Login successful", data: user });
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
      return reply.status(422).send({ message: "Email already exists" });
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
      return reply
        .status(422)
        .send({ message: "Invalid OTP code either used or expired" });
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

    return reply.status(200).send({ message: "Sign up successful",data:user });
  };
}
