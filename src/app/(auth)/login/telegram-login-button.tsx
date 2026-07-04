"use client";

import { useEffect, useRef } from "react";

interface Props {
  botUsername: string;
  authUrl?: string;
  size?: "large" | "medium" | "small";
  cornerRadius?: number;
  requestAccess?: boolean;
}

export function TelegramLoginButton({
  botUsername,
  authUrl = "/api/auth/telegram/callback",
  size = "large",
  cornerRadius,
  requestAccess = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", size);
    script.setAttribute(
      "data-auth-url",
      new URL(authUrl, window.location.origin).toString(),
    );
    if (typeof cornerRadius === "number") {
      script.setAttribute("data-radius", String(cornerRadius));
    }
    if (requestAccess) {
      script.setAttribute("data-request-access", "write");
    }
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [botUsername, authUrl, size, cornerRadius, requestAccess]);

  return <div ref={containerRef} />;
}
