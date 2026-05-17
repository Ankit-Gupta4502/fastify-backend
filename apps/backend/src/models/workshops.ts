import { relations } from "drizzle-orm";
import { pgTable, text, uuid, integer } from "drizzle-orm/pg-core";
import { registeredWorkshops } from "./workshop.user";

export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price"),
  image: text("image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const workShopRegisteredUsers = relations(workshops, ({many}) => ({
    registeredUsers: many(registeredWorkshops)
}));
