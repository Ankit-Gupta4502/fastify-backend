import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import { Pool } from "pg";
import { backendEnvPath } from "../config/env";
import { getDatabaseDriver, getDatabaseUrl } from "../config/database";
import * as schema from "../schema/schema";
import type { AppDatabase } from "../types/database.types";

dotenv.config({
  path: backendEnvPath,
});

const driver = getDatabaseDriver();
const connectionString = getDatabaseUrl();

const pool =
  driver === "pg" ? new Pool({ connectionString }) : undefined;

function createDatabase(): AppDatabase {
  if (driver === "neon") {
    return drizzleNeon(neon(connectionString), { schema });
  }
  return drizzlePg(pool!, { schema });
}

export const drizzle = createDatabase();

export type { AppDatabase } from "../types/database.types";

export default fp(async (app) => {
  app.addHook("onClose", async () => {
    if (pool) {
      await pool.end();
    }
  });
});
