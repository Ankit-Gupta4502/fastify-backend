import { usersTable } from "../models/user.schema";
import { otpTable } from "../models/otp.schema";
import { services } from "../models/serivces.schema";
import { accounts } from "../models/accounts.schema";
import { relations } from "drizzle-orm";

export const usersRelations = relations(usersTable, ({ many }) => ({
  accounts: many(accounts),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(usersTable, {
    fields: [accounts.userId],
    references: [usersTable.id],
  }),
  service: one(services, {
    fields: [accounts.serviceId],
    references: [services.id],
  }),
}));



export { usersTable, otpTable, services, accounts };
