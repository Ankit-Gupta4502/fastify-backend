import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { uploadFile, deleteFile } from "../../services/upload.service";
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
        router.delete(
          "/attachment",
          { preHandler: this.authMiddleware.handle },
          this.delete,
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

  private delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { key } = request.query as { key?: string };

    if (!key || typeof key !== "string" || !key.startsWith("uploads/")) {
      const { statusCode, payload } = errorResponse({ message: "Invalid key", statusCode: 400 });
      return reply.status(statusCode).send(payload);
    }

    try {
      await deleteFile(key);
      const { statusCode, payload } = successResponse({ message: "Deleted", data: null });
      return reply.status(statusCode).send(payload);
    } catch (err) {
      const { statusCode, payload } = errorResponse({
        message: err instanceof Error ? err.message : "Delete failed",
        statusCode: 400,
      });
      return reply.status(statusCode).send(payload);
    }
  };
}
