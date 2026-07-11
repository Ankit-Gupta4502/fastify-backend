import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { rooms } from "./rooms";

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
  "session_credit",
]);

export const instructorWallet = pgTable("instructor_wallet", {
  id: uuid("id").defaultRandom().primaryKey(),
  instructorId: uuid("instructor_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  balancePaise: bigint("balance_paise", { mode: "number" })
    .notNull()
    .default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const walletTransaction = pgTable(
  "wallet_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => instructorWallet.id, { onDelete: "cascade" }),
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roomId: uuid("room_id").references(() => rooms.id, {
      onDelete: "set null",
    }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    type: walletTransactionTypeEnum("type").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_wallet_tx_instructor").on(t.instructorId, t.createdAt),
    unique("uq_wallet_tx_room").on(t.walletId, t.roomId),
  ],
);

export const instructorWalletRelations = relations(
  instructorWallet,
  ({ one, many }) => ({
    instructor: one(user, {
      fields: [instructorWallet.instructorId],
      references: [user.id],
    }),
    transactions: many(walletTransaction),
  }),
);

export const walletTransactionRelations = relations(
  walletTransaction,
  ({ one }) => ({
    wallet: one(instructorWallet, {
      fields: [walletTransaction.walletId],
      references: [instructorWallet.id],
    }),
    room: one(rooms, {
      fields: [walletTransaction.roomId],
      references: [rooms.id],
    }),
  }),
);
