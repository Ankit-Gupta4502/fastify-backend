import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
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
    weekStart: date("week_start").notNull(),
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
