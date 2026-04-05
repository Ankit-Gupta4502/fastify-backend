import fp from "fastify-plugin";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../schema/schema";

declare module "fastify" {
  interface FastifyInstance {
    drizzle: NeonHttpDatabase<typeof schema>;
  }
  interface FastifyRequest {
    drizzle: NeonHttpDatabase<typeof schema>;
  }
}

export default fp(async (app) => {
  const db = drizzle(process.env.DATABASE_URL!,{schema});
  app.decorate("drizzle", db);
});
