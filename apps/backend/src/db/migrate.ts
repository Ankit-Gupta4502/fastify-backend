import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import dotenv from "dotenv";
import { backendEnvPath } from "../config/env";

dotenv.config({ path: backendEnvPath });

const migrationsFolder = fileURLToPath(
  new URL("../migrations", import.meta.url),
);

async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Running migrations with driver: postgres-js (Supabase)");

  await migrate(db, { migrationsFolder });

  await client.end();
  console.log("Migrations completed successfully");
}

runMigrations()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
