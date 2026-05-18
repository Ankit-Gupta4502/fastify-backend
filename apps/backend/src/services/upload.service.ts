import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

export interface UploadResult {
  url: string;
  key: string;
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// The root from which the /uploads static route is served
const UPLOAD_DIR = join(process.cwd(), "uploads");

/**
 * Save a file to local disk and return a public URL.
 *
 * TODO: swap this implementation for S3 / Cloudflare R2 / Supabase Storage
 * when a bucket is provisioned — only this file needs to change.
 * The UploadResult shape stays the same so all callers keep working.
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadResult> {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp, gif`);
  }

  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("File exceeds the 5 MB limit");
  }

  const ext = extname(originalName) || `.${mimeType.split("/")[1]}`;
  const key = `${randomUUID()}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, key), buffer);

  const baseUrl = process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 8080}`;
  return { url: `${baseUrl}/uploads/${key}`, key };
}
