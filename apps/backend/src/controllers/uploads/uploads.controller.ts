import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { uploadFile } from "../../services/upload.service";
import { errorResponse, successResponse } from "../../utils";

export class UploadsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        router.post(
          "/attachment",
          { preHandler: this.authMiddleware.handle },
          this.upload,
        );
      },
      { prefix: "/uploads" },
    );
  }

  private upload = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();

    if (!data) {
      const { statusCode, payload } = errorResponse({
        message: "No file provided",
        statusCode: 400,
      });
      return reply.status(statusCode).send(payload);
    }

    const buffer = await data.toBuffer();

    try {
      const result = await uploadFile(buffer, data.filename, data.mimetype);
      const { statusCode, payload } = successResponse({
        message: "Uploaded",
        data: result,
        statusCode: 201,
      });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      const { statusCode, payload } = errorResponse({
        message: err instanceof Error ? err.message : "Upload failed",
        statusCode: 400,
      });
      return reply.status(statusCode).send(payload);
    }
  };
}
