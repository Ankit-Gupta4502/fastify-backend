import dotenv from "dotenv";
import { drizzle as drizzleOrm } from "drizzle-orm/node-postgres";
import fp from "fastify-plugin";
import { Pool } from "pg";
import { backendEnvPath } from "../config/env";
import { getDatabaseUrl } from "../config/database";
import * as schema from "../schema/schema";

dotenv.config({
  path: backendEnvPath,
});

const pool = new Pool({ connectionString: getDatabaseUrl() });

export const drizzle = drizzleOrm(pool, { schema });

export type { AppDatabase } from "../types/database.types";

export default fp(async (app) => {
  app.addHook("onClose", async () => {
    await pool.end();
  });
});
