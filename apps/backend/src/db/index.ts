import dotenv from "dotenv";
import { drizzle as drizzleOrm } from "drizzle-orm/postgres-js";
import fp from "fastify-plugin";
import postgres from "postgres";
import { backendEnvPath } from "../config/env";
import { getDatabaseUrl } from "../config/database";
import * as schema from "../schema/schema";

dotenv.config({
  path: backendEnvPath,
});

const pool = postgres(getDatabaseUrl(), { prepare: false });

export const drizzle = drizzleOrm(pool, { schema, });

export type { AppDatabase } from "../types/database.types";

export default fp(async (app) => {
  app.addHook("onClose", async () => {
    await pool.end();
  });
});
