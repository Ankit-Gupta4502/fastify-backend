import { randomBytes } from "node:crypto";
import { config } from "../config";

// Unambiguous alphabet — no 0/O or 1/I/L — since codes are read/typed by humans.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export function generateReferralCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export function buildReferralLink(code: string): string {
  return `${config.frontend.url}/register?ref=${code}`;
}
