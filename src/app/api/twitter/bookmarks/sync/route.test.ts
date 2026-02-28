import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mapXBookmarksToTweetsMock = vi.fn();
const persistBookmarksForOwnerWithClientMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("@/lib/twitter", () => ({
  mapXBookmarksToTweets: mapXBookmarksToTweetsMock,
}));

vi.mock("@/lib/bookmarkPersistence", () => ({
  persistBookmarksForOwnerWithClient: persistBookmarksForOwnerWithClientMock,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

function makeRequest(cookieValues: Record<string, string>): NextRequest {
  return {
    nextUrl: new URL("http://localhost:3000/api/twitter/bookmarks/sync"),
    cookies: {
      get(name: string) {
        const value = cookieValues[name];
        return value ? { value } : undefined;
      },
    },
  } as unknown as NextRequest;
}

describe("/api/twitter/bookmarks/sync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mapXBookmarksToTweetsMock.mockReset();
    persistBookmarksForOwnerWithClientMock.mockReset();
    createClientMock.mockReset();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "service-role-key";
  });

  it("returns 401 when user is not connected to X", async () => {
    const { POST } = await import("./route");
    const response = await POST(makeRequest({}));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain("Not connected");
  });

  it("calls X API only from sync endpoint and persists mapped tweets", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: "1", text: "hello", author_id: "u1" }],
        includes: { users: [{ id: "u1", username: "marko", name: "Marko" }] },
        meta: {},
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    mapXBookmarksToTweetsMock.mockReturnValue([
      {
        id: -1,
        tweet_id: "1",
        tweet_text: "hello",
        author_handle: "marko",
        author_display_name: "Marko",
        author_avatar_url: null,
        timestamp: null,
        source_url: "https://x.com/marko/status/1",
        media: [],
        link_cards: [],
        quoted_tweet_id: null,
        quoted_tweet: null,
        in_reply_to_tweet_id: null,
        conversation_id: null,
        raw_json: null,
        tags: [],
        notes: null,
        saved_at: null,
        created_at: null,
      },
    ]);

    persistBookmarksForOwnerWithClientMock.mockResolvedValue({
      canonical_upserted: 1,
      membership_upserted: 1,
      bookmarks_collection_id: "col-1",
      retried_without_optional_fields: false,
      used_legacy_owner_column: false,
    });

    createClientMock.mockReturnValue({
      from: vi.fn(),
    });

    const { POST } = await import("./route");
    const response = await POST(
      makeRequest({
        x_access_token: "access-token",
        x_user_id: "123",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? "");
    expect(calledUrl).toContain("tweet.fields=");
    expect(calledUrl).toContain("article");
    expect(mapXBookmarksToTweetsMock).toHaveBeenCalledTimes(1);
    expect(persistBookmarksForOwnerWithClientMock).toHaveBeenCalledTimes(1);
    expect(payload.status).toBe("ok");
    expect(payload.fetched_count).toBe(1);
    expect(payload.persisted_count).toBe(1);
    expect(payload.canonical_upserted).toBe(1);
    expect(payload.bookmarks_collection_id).toBe("col-1");
    expect(payload.retried_without_optional_fields).toBe(false);
    expect(payload.used_legacy_owner_column).toBe(false);
  });
});
