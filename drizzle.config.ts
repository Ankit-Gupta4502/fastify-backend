import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.DATABASE_URL,"urlll")

export default {
  schema: "./src/schema/schema.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
