import { randomUUID, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

const HMS_API_BASE = "https://api.100ms.live/v2";

type HmsRoleAudience = "instructor" | "user";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function managementToken(): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      access_key: requireEnv("HMS_APP_ACCESS_KEY"),
      type: "management",
      version: 2,
      jti: randomUUID(),
      iat: now,
      nbf: now,
      exp: now + 86_400,
    },
    requireEnv("HMS_APP_SECRET"),
    { algorithm: "HS256" },
  );
}

export type CreateHmsRoomResult = {
  hmsRoomId: string;
  hmsRoomCode: string | null;
};

export async function createHmsRoom(isPrivate: boolean): Promise<CreateHmsRoomResult> {
  const templateId = isPrivate
    ? requireEnv("HMS_TEMPLATE_ID_PRIVATE")
    : requireEnv("HMS_TEMPLATE_ID_GROUP");

  const token = managementToken();
  const roomRes = await fetch(`${HMS_API_BASE}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `yoga-${Date.now()}`,
      template_id: templateId,
    }),
  });

  const room = (await roomRes.json()) as { id?: string; message?: string };
  if (!roomRes.ok || !room.id) {
    throw new Error(`100ms room create failed: ${room.message ?? roomRes.status}`);
  }

  // Fetch a guest room code for the hosted prebuilt
  let hmsRoomCode: string | null = null;
  try {
    const codeRes = await fetch(`${HMS_API_BASE}/room-codes/room/${room.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const codePayload = (await codeRes.json()) as {
      data?: Array<{ role?: string; code?: string }>;
    };
    const guestEntry =
      codePayload.data?.find((c) => c.role === "guest") ?? codePayload.data?.[0];
    hmsRoomCode = guestEntry?.code ?? null;
  } catch {
    // Room codes are optional — fall back to native token flow if they fail
  }

  return { hmsRoomId: room.id, hmsRoomCode };
}

export function verifyHmsWebhookSignature(_rawBody: Buffer, signature: string): boolean {
  const secret = requireEnv("HMS_WEBHOOK_SECRET");
  const secretBuf = Buffer.from(secret);
  const sigBuf = Buffer.from(signature);
  if (secretBuf.length !== sigBuf.length) return false;
  return timingSafeEqual(secretBuf, sigBuf);
}

export function generateClientToken(params: {
  hmsRoomId: string;
  userId: string;
  audience: HmsRoleAudience;
}): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      access_key: requireEnv("HMS_APP_ACCESS_KEY"),
      room_id: params.hmsRoomId,
      user_id: params.userId,
      role: params.audience === "instructor" ? "host" : "guest",
      type: "app",
      version: 2,
      jti: randomUUID(),
      iat: now,
      nbf: now,
      exp: now + 7_200,
    },
    requireEnv("HMS_APP_SECRET"),
    { algorithm: "HS256" },
  );
}
