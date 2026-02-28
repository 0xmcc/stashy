import { beforeEach, describe, expect, it, vi } from "vitest";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/chat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
  });

  it("returns an assistant reply when Anthropic succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ type: "text", text: "Draft tweet [1]" }],
        }),
      })
    );

    const { POST } = await import("./route.js");
    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Write tweet from selected." }],
        retrievedItems: [{ id: "a", content: "Source A" }],
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.reply?.content).toBe("Draft tweet [1]");
  });

  it("returns a clear auth error when Anthropic rejects API key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        text: async () =>
          JSON.stringify({
            type: "error",
            error: { type: "authentication_error", message: "invalid x-api-key" },
          }),
      })
    );

    const { POST } = await import("./route.js");
    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Write tweet from selected." }],
        retrievedItems: [{ id: "a", content: "Source A" }],
      })
    );
    const payload = await response.json();

    // Desired behavior: expose provider auth failure explicitly for easier debugging.
    expect(response.status).toBe(502);
    expect(payload.error).toContain("authentication");
  });
});
