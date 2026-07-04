import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramAuthData {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: number;
}

const MAX_AGE_SECONDS = 60 * 60 * 24;

export function verifyTelegramAuth(
  params: Record<string, string>,
  botToken: string,
): TelegramAuthData | null {
  const { hash, ...rest } = params;
  if (!hash || !rest.id || !rest.auth_date || !rest.first_name) return null;

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");

  const secretKey = createHash("sha256").update(botToken).digest();
  const computed = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const received = Buffer.from(hash, "hex");
  const expected = Buffer.from(computed, "hex");
  if (received.length !== expected.length) return null;
  if (!timingSafeEqual(received, expected)) return null;

  const authDate = Number(rest.auth_date);
  if (!Number.isFinite(authDate)) return null;
  if (Math.floor(Date.now() / 1000) - authDate > MAX_AGE_SECONDS) return null;

  return {
    id: rest.id,
    firstName: rest.first_name,
    lastName: rest.last_name || undefined,
    username: rest.username || undefined,
    photoUrl: rest.photo_url || undefined,
    authDate,
  };
}
