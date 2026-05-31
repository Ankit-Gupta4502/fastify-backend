import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { review, user } from "../../schema/schema";
import { successResponse } from "../../utils";

export class ReviewsController {
  constructor(private readonly app: FastifyInstance) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.get("/reviews", {}, this.listPublicReviews);
  }

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
      userName: r.userName ?? "Anonymous",
    }));

    const { statusCode, payload } = successResponse({ message: "Public reviews", data });
    return reply.status(statusCode).send(payload);
  };
}
