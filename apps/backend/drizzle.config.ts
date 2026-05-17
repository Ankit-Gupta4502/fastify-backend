import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import { backendEnvPath } from "./src/config/env";
import { getDatabaseUrl } from "./src/config/database";

dotenv.config({
  path: backendEnvPath,
});

export default {
  schema: "./src/schema/schema.ts",
  out: "./src/migrations",
  dialect:"postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
} satisfies Config;
