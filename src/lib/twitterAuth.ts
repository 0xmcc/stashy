import type { NextRequest } from "next/server";

export const TWITTER_OAUTH_CALLBACK_COOKIE = "x_oauth_callback_url";

type RequestLike = Pick<NextRequest, "url">;

export function buildTwitterCallbackUrl(request: RequestLike): string {
  return new URL("/api/auth/twitter/callback", request.url).toString();
}

export function resolveTwitterCallbackUrl(
  request: RequestLike,
  storedCallbackUrl?: string | null
): string {
  const derived = new URL(buildTwitterCallbackUrl(request));

  if (!storedCallbackUrl) {
    return derived.toString();
  }

  try {
    const stored = new URL(storedCallbackUrl);
    if (
      stored.origin === derived.origin &&
      stored.pathname === "/api/auth/twitter/callback"
    ) {
      return stored.toString();
    }
  } catch {
    // Ignore invalid cookie values and fall back to the live request origin.
  }

  return derived.toString();
}
