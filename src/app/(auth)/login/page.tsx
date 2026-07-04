import type { Metadata } from "next";
import { TelegramLoginButton } from "./telegram-login-button";

export const metadata: Metadata = {
  title: "Sign in",
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Use your Telegram account to continue.
          </p>
        </div>

        {botUsername ? (
          <TelegramLoginButton botUsername={botUsername} />
        ) : (
          <p className="text-center text-sm text-red-600">
            <code>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</code> is not set.
          </p>
        )}

        {error === "invalid" && (
          <p className="text-center text-sm text-red-600">
            We couldn&apos;t verify that Telegram sign-in. Please try again.
          </p>
        )}
      </div>
    </main>
  );
}
