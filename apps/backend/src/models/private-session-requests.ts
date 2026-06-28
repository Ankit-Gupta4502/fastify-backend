import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { rooms } from "./rooms";

export const privateSessionRequests = pgTable("private_session_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => user.id),
  requestedStart: timestamp("requested_start", { withTimezone: true }).notNull(),
  requestedEnd: timestamp("requested_end", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  instructorId: uuid("instructor_id").references(() => user.id),
  roomId: uuid("room_id").references(() => rooms.id),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
