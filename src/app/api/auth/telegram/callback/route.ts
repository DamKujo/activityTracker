import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { verifyTelegramAuth } from "@/lib/telegram-auth";

export async function GET(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const auth = verifyTelegramAuth(params, botToken);
  if (!auth) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(auth.id) },
    create: {
      telegramId: BigInt(auth.id),
      firstName: auth.firstName,
      lastName: auth.lastName,
      username: auth.username,
      photoUrl: auth.photoUrl,
    },
    update: {
      firstName: auth.firstName,
      lastName: auth.lastName,
      username: auth.username,
      photoUrl: auth.photoUrl,
    },
  });

  const response = NextResponse.redirect(new URL("/", request.url));
  setSessionCookie(response, user.id);
  return response;
}
