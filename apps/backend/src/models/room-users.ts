import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES,
} from "../constants/sessions";
import { user } from "./auth.schema";
import { rooms } from "./rooms";

export const bookingStatusEnum = pgEnum(
  "booking_status",
  BOOKING_STATUS_VALUES as [string, ...string[]],
);

export const roomUsers = pgTable(
  "room_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
    status: bookingStatusEnum("status").notNull().default(BOOKING_STATUS.ACTIVE),
    hmsPeerId: text("hms_peer_id"),
  },
  (t) => [
    index("idx_room_users_room").on(t.roomId),
    index("idx_room_users_user").on(t.userId, t.joinedAt),
  ],
);

export const roomUsersRelations = relations(roomUsers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomUsers.roomId],
    references: [rooms.id],
  }),
  user: one(user, {
    fields: [roomUsers.userId],
    references: [user.id],
  }),
}));
