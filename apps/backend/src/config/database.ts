export type DatabaseDriver = "pg" | "neon";

export function getDatabaseDriver(): DatabaseDriver {
  const explicit = process.env.DATABASE_DRIVER?.toLowerCase();
  if (explicit === "pg" || explicit === "neon") {
    return explicit;
  }

  return process.env.NODE_ENV === "production" ? "neon" : "pg";
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  console.log(url,"urllll")
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  return url;
}
