import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { fileURLToPath } from "node:url";
import { drizzle } from "./index";
import { getDatabaseDriver } from "../config/database";

const migrationsFolder = fileURLToPath(
  new URL("../migrations", import.meta.url),
);

async function runMigrations() {
  const driver = getDatabaseDriver();

  console.log(`Running migrations with driver: ${driver}`);

  if (driver === "neon") {
    await migrateNeon(drizzle as unknown as NeonHttpDatabase, { migrationsFolder });
  } else {
    await migratePg(drizzle as unknown as NodePgDatabase, { migrationsFolder });
  }

  console.log("Migrations completed successfully");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
