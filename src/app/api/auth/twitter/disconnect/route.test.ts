import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

const COOKIE_NAMES = [
  "x_access_token",
  "x_refresh_token",
  "x_user_id",
  "x_user_handle",
  "x_expires_at",
  "x_oauth_verifier",
  "x_oauth_state",
];

function makeRequest(method = "POST"): NextRequest {
  return { url: "http://localhost/", method } as unknown as NextRequest;
}

function assertCookiesCleared(response: Response): void {
  const cookieStr = response.headers.get("set-cookie") ?? "";
  for (const name of COOKIE_NAMES) {
    expect(cookieStr, `${name} should appear in Set-Cookie`).toContain(name);
  }
  expect(cookieStr, "Max-Age=0 should appear to clear cookies").toContain("Max-Age=0");
}

describe("disconnect route", () => {
  it("POST redirects to / and clears all Twitter cookies", async () => {
    const response = await POST(makeRequest("POST"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
    assertCookiesCleared(response);
  });

  it("GET redirects to / and clears all Twitter cookies", async () => {
    const response = await GET(makeRequest("GET"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
    assertCookiesCleared(response);
  });
});
