import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { drizzle } from "../../db";
import { review, user } from "../../schema/schema";
import { errorResponse, successResponse, validateWithZod } from "../../utils";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { USER_ROLES } from "../../constants/roles";
import { createReviewSchema, updateReviewSchema } from "@yoga-app/shared";

const reviewIdSchema = z.object({ id: z.string().uuid("Invalid review id") });

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export class ReviewsController {
  constructor(
    private readonly authMiddleware: AuthMiddleware,
    private readonly app: FastifyInstance,
  ) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    const adminGuard = [
      this.authMiddleware.handle,
      requireRole(USER_ROLES.ADMIN),
    ];

    app.get("/reviews", {}, this.listPublicReviews);

    app.register(
      async (router) => {
        router.get("/", { preHandler: adminGuard }, this.adminListReviews);
        router.post("/", { preHandler: adminGuard }, this.adminCreateReview);
        router.patch("/:id", { preHandler: adminGuard }, this.adminUpdateReview);
        router.delete("/:id", { preHandler: adminGuard }, this.adminDeleteReview);
      },
      { prefix: "/admin/reviews" },
    );
  }

  // ── Public ────────────────────────────────────────────────────────────────

  private listPublicReviews = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const rows = await drizzle
      .select({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        reviewerName: review.reviewerName,
        userName: user.name,
      })
      .from(review)
      .leftJoin(user, eq(review.userId, user.id))
      .orderBy(desc(review.rating), desc(review.createdAt))
      .limit(6);

    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.reviewerName ?? r.userName ?? "Anonymous",
    }));

    const { statusCode, payload } = successResponse({ message: "Public reviews", data });
    return reply.status(statusCode).send(payload);
  };

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  private adminListReviews = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const rows = await drizzle
      .select({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewerName: review.reviewerName,
        videoUrl: review.videoUrl,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userName: user.name,
      })
      .from(review)
      .leftJoin(user, eq(review.userId, user.id))
      .orderBy(desc(review.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewerName: r.reviewerName ?? r.userName ?? "Anonymous",
      videoUrl: r.videoUrl ?? "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const { statusCode, payload } = successResponse({ message: "All reviews", data });
    return reply.status(statusCode).send(payload);
  };

  private adminCreateReview = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, { body: createReviewSchema });
    if (invalid) return invalid;

    const body = request.body as z.infer<typeof createReviewSchema>;

    const [created] = await drizzle
      .insert(review)
      .values({
        reviewerName: body.reviewerName,
        rating: body.rating,
        comment: body.comment,
        videoUrl: body.videoUrl ?? "",
        createdAt: today(),
        updatedAt: today(),
      })
      .returning();

    const { statusCode, payload } = successResponse({
      message: "Review created",
      data: created,
      statusCode: 201,
    });
    return reply.status(statusCode).send(payload);
  };

  private adminUpdateReview = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalidParams = validateWithZod(request, reply, { params: reviewIdSchema });
    if (invalidParams) return invalidParams;
    const invalidBody = validateWithZod(request, reply, { body: updateReviewSchema });
    if (invalidBody) return invalidBody;

    const { id } = request.params as z.infer<typeof reviewIdSchema>;
    const body = request.body as z.infer<typeof updateReviewSchema>;

    const existing = await drizzle.query.review.findFirst({ where: eq(review.id, id) });
    if (!existing) {
      const { statusCode, payload } = errorResponse({ message: "Review not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    const [updated] = await drizzle
      .update(review)
      .set({
        ...(body.reviewerName !== undefined && { reviewerName: body.reviewerName }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.comment !== undefined && { comment: body.comment }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        updatedAt: today(),
      })
      .where(eq(review.id, id))
      .returning();

    const { statusCode, payload } = successResponse({ message: "Review updated", data: updated });
    return reply.status(statusCode).send(payload);
  };

  private adminDeleteReview = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const invalid = validateWithZod(request, reply, { params: reviewIdSchema });
    if (invalid) return invalid;

    const { id } = request.params as z.infer<typeof reviewIdSchema>;

    const existing = await drizzle.query.review.findFirst({ where: eq(review.id, id) });
    if (!existing) {
      const { statusCode, payload } = errorResponse({ message: "Review not found", statusCode: 404 });
      return reply.status(statusCode).send(payload);
    }

    await drizzle.delete(review).where(eq(review.id, id));

    const { statusCode, payload } = successResponse({ message: "Review deleted", data: null });
    return reply.status(statusCode).send(payload);
  };
}
