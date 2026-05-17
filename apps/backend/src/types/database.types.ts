import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "../schema/schema";

export type AppDatabase =
  | NeonHttpDatabase<typeof schema>
  | NodePgDatabase<typeof schema>;
