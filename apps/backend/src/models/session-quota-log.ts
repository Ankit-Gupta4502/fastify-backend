import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { rooms } from "./rooms";

export const sessionQuotaLog = pgTable(
  "session_quota_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    // Stores the period start at enrolment: date_trunc('week') for weekly plans,
    // date_trunc('month') for monthly plans.
    weekStart: date("week_start").notNull(),
    // Billing interval active at enrolment time — used by leaveRoom to restore
    // the correct counter even if the user changes plans before cancelling.
    billingInterval: text("billing_interval").notNull().default("week"),
    sessionCount: integer("session_count").notNull().default(1),
    counted: boolean("counted").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_quota_user_week").on(t.userId, t.weekStart),
    unique("uq_quota_user_week_room").on(t.userId, t.weekStart, t.roomId),
  ],
);

export const sessionQuotaLogRelations = relations(
  sessionQuotaLog,
  ({ one }) => ({
    user: one(user, {
      fields: [sessionQuotaLog.userId],
      references: [user.id],
    }),
    room: one(rooms, {
      fields: [sessionQuotaLog.roomId],
      references: [rooms.id],
    }),
  }),
);
