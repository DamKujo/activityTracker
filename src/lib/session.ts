import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function encode(userId: string, expiresAt: number, secret: string): string {
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

function decode(
  value: string,
  secret: string,
): { userId: string; expiresAt: number } | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  const expected = sign(`${userId}.${expStr}`, secret);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt)) return null;
  if (expiresAt < Math.floor(Date.now() / 1000)) return null;
  return { userId, expiresAt };
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  response.cookies.set(COOKIE_NAME, encode(userId, expiresAt, getSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const decoded = decode(value, getSecret());
  if (!decoded) return null;
  return { userId: decoded.userId };
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
