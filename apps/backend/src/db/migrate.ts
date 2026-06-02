import { migrate } from "drizzle-orm/postgres-js/migrator";
import { fileURLToPath } from "node:url";
import { drizzle } from "./index";

const migrationsFolder = fileURLToPath(
  new URL("../migrations", import.meta.url),
);

async function runMigrations() {
  console.log("Running migrations with driver: postgres-js (Supabase)");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await migrate(drizzle as any, { migrationsFolder });

  console.log("Migrations completed successfully");
}

runMigrations()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
