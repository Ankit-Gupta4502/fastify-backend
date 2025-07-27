import { integer, pgTable, varchar,boolean,uuid } from "drizzle-orm/pg-core";


export const otpTable = pgTable("otp", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  isUsed: boolean("is_used").default(false),
});

export type InsertOtp = typeof otpTable.$inferInsert;
export type SelectOtp = typeof otpTable.$inferSelect;