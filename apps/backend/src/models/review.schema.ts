import { relations } from "drizzle-orm";
import { pgTable, text, date, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const review = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  reviewerName: text("reviewer_name"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
  videoUrl: text("video_url").default(""),
});

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));
