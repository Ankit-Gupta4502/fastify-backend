import {pgTable,uuid,timestamp,varchar} from "drizzle-orm/pg-core"

export const usersTable = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name",{length:255}).notNull(),
  email: varchar("email",{length:255}).notNull(),
  password:varchar("password",{length:255}).notNull(),
  phone: varchar("phone",{length:255}).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;