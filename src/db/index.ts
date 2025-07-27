import fp from "fastify-plugin";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema/schema";

declare module "fastify" {
  interface FastifyInstance {
    drizzle: NodePgDatabase<typeof schema>;
  }
  interface FastifyRequest {
    drizzle: NodePgDatabase<typeof schema>;
  }
}

export default fp(async (app) => {
  const pool =  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db: NodePgDatabase<typeof schema> =  drizzle(pool, { schema });
  app.decorate("drizzle", db);
});
