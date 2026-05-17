import { AuthMiddleware } from "../../middleware/auth.middleware";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { userSwaggerSchemas } from "../../validation/user.validation.schema";
import { successResponse, errorResponse } from "../../utils";
import db from "../../db";

export class UserController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {


        router.get(
          "/detail",
          {
            preHandler: this.authMiddleware.handle,
            schema: userSwaggerSchemas.getUserDetail,
          },
          this.getUserDetail
        );




      },

      { prefix: "/user" }
    );
  }

  private getUserDetail = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const user = request.user;
    if (!user) {
      const { statusCode, payload: body } = errorResponse({
        message: "User not found",
        statusCode: 404,
      });
      return reply.status(statusCode).send(body);
    }
    

    const { statusCode, payload: body } = successResponse({
      message: "User details fetched successfully",
      data: user,
    });
    return reply.status(statusCode).send(body);
  };
}
