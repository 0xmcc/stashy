import { beforeEach, describe, expect, it, vi } from "vitest";

const embeddingCreateMock = vi.fn();
const rpcMock = vi.fn();
const limitMock = vi.fn();
const orMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("openai", () => {
  class OpenAIMock {
    embeddings = {
      create: embeddingCreateMock,
    };
  }

  return {
    default: OpenAIMock,
  };
});

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: createClientMock,
  };
});

function makeRequest(body: unknown, mode?: "keyword" | "semantic"): Request {
  const url = mode
    ? `http://localhost:3000/api/search?mode=${mode}`
    : "http://localhost:3000/api/search";

  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "test-service-key";

    embeddingCreateMock.mockResolvedValue({
      data: [{ embedding: [0.01, 0.02, 0.03] }],
    });
    rpcMock.mockResolvedValue({ data: [], error: null });

    limitMock.mockResolvedValue({
      data: [{ tweet_id: "1", tweet_text: "keyword match", author_handle: "marko" }],
      error: null,
    });

    orMock.mockReturnValue({ limit: limitMock });
    selectMock.mockReturnValue({ or: orMock });
    fromMock.mockReturnValue({ select: selectMock });

    createClientMock.mockReturnValue({
      from: fromMock,
      rpc: rpcMock,
    });
  });

  it("uses direct DB keyword lookup for plain keyword queries", async () => {
    const { POST } = await import("./route");

    const response = await POST(makeRequest({ query: "keyword" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(embeddingCreateMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith("tweets");
    expect(payload.results).toHaveLength(1);
  });

  it("supports forcing semantic mode for keyword query", async () => {
    const { POST } = await import("./route");

    const response = await POST(makeRequest({ query: "keyword" }, "semantic"));

    expect(response.status).toBe(200);
    expect(embeddingCreateMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("supports forcing keyword mode for long query", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      makeRequest({ query: "this query is intentionally long to bypass auto keyword mode" }, "keyword")
    );

    expect(response.status).toBe(200);
    expect(embeddingCreateMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith("tweets");
  });
});
