import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadResult> {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp, gif`,
    );
  }

  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("File exceeds the 5 MB limit");
  }

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
  if (!publicUrl) throw new Error("R2_PUBLIC_URL is not configured");

  const ext = extname(originalName) || `.${mimeType.split("/")[1]}`;
  const key = `uploads/${randomUUID()}${ext}`;

  await createR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  const url = `${publicUrl.replace(/\/$/, "")}/${key}`;
  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");

  await createR2Client().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}
