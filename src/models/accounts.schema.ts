import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  
} from "drizzle-orm/pg-core";
import { usersTable as users, services } from "../schema/schema";

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  // The id of the account on the provider side (e.g. ig user id / yt channel id)
  providerAccountId: text("provider_account_id").notNull(),

  username: text("username"),
  displayName: text("display_name"),

  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),

  scopes: text("scopes").array(), // optional array of granted scopes

  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}), // anything extra you want to store

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
