import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tweet } from "./supabase";
import { persistBookmarksForOwnerWithClient } from "./bookmarkPersistence";

interface UpsertCall {
  table: string;
  rows: unknown;
  options: Record<string, unknown> | undefined;
}

interface MockSupabaseOptions {
  tweetsErrors?: Array<unknown | null>;
  collectionResults?: Array<{ data: { id: string } | null; error: unknown | null }>;
  membershipError?: unknown | null;
}

function createTweet(tweetId: string, overrides: Partial<Tweet> = {}): Tweet {
  return {
    id: -1,
    tweet_id: tweetId,
    tweet_text: "hello",
    author_handle: "marko",
    author_display_name: "Marko",
    author_avatar_url: "https://example.com/avatar.png",
    timestamp: "2026-01-01T00:00:00.000Z",
    source_url: `https://x.com/marko/status/${tweetId}`,
    media: [],
    link_cards: [],
    quoted_tweet_id: null,
    quoted_tweet: null,
    in_reply_to_tweet_id: null,
    conversation_id: null,
    raw_json: {},
    tags: [],
    notes: null,
    saved_at: null,
    created_at: null,
    public_metrics: {
      like_count: 1,
      retweet_count: 2,
      reply_count: 3,
      bookmark_count: 4,
      impression_count: 5,
    },
    ...overrides,
  };
}

function createSupabaseMock(options: MockSupabaseOptions = {}) {
  const calls: UpsertCall[] = [];
  const tweetsErrors = options.tweetsErrors ?? [null];
  const collectionResults = options.collectionResults ?? [{ data: { id: "col-1" }, error: null }];
  const membershipError = options.membershipError ?? null;
  let tweetsAttempt = 0;
  let collectionAttempt = 0;

  const supabase = {
    from(table: string) {
      return {
        upsert(rows: unknown, upsertOptions?: Record<string, unknown>) {
          calls.push({ table, rows, options: upsertOptions });

          if (table === "tweets") {
            const error = tweetsErrors[tweetsAttempt] ?? null;
            tweetsAttempt += 1;
            return Promise.resolve({ error });
          }

          if (table === "collections") {
            return {
              select() {
                return {
                  single() {
                    const result = collectionResults[collectionAttempt] ?? collectionResults[collectionResults.length - 1];
                    collectionAttempt += 1;
                    return Promise.resolve(result);
                  },
                };
              },
            };
          }

          if (table === "collection_tweets") {
            return Promise.resolve({ error: membershipError });
          }

          return Promise.resolve({ error: null });
        },
      };
    },
  } as unknown as SupabaseClient;

  return { supabase, calls };
}

describe("persistBookmarksForOwnerWithClient", () => {
  it("upserts canonical tweets, bookmarks collection, and membership with deduped tweet ids", async () => {
    const { supabase, calls } = createSupabaseMock();

    const result = await persistBookmarksForOwnerWithClient(supabase, "x-user-1", [
      createTweet("111"),
      createTweet("111", { tweet_text: "newer text" }),
    ]);

    const tweetCall = calls.find((call) => call.table === "tweets");
    const collectionCall = calls.find((call) => call.table === "collections");
    const membershipCall = calls.find((call) => call.table === "collection_tweets");

    expect(tweetCall).toBeDefined();
    expect(collectionCall).toBeDefined();
    expect(membershipCall).toBeDefined();

    expect((tweetCall?.rows as unknown[]).length).toBe(1);
    expect((tweetCall?.rows as Array<Record<string, unknown>>)[0].tweet_id).toBe("111");
    expect(tweetCall?.options).toEqual({ onConflict: "tweet_id" });

    expect(collectionCall?.rows).toEqual({
      owner_user_id: "x-user-1",
      name: "Bookmarks",
      slug: "bookmarks",
      visibility: "private",
      is_system: true,
    });
    expect(collectionCall?.options).toEqual({
      onConflict: "owner_user_id,slug",
      ignoreDuplicates: false,
    });

    expect((membershipCall?.rows as unknown[]).length).toBe(1);
    expect((membershipCall?.rows as Array<Record<string, string>>)[0]).toEqual({
      collection_id: "col-1",
      tweet_id: "111",
    });
    expect(membershipCall?.options).toEqual({
      onConflict: "collection_id,tweet_id",
      ignoreDuplicates: true,
    });
    expect(result.used_legacy_owner_column).toBe(false);
  });

  it("retries tweet upsert without optional fields when schema is missing quoted/public metrics columns", async () => {
    const { supabase, calls } = createSupabaseMock({
      tweetsErrors: [
        { message: 'column "quoted_tweet" of relation "tweets" does not exist' },
        null,
      ],
    });

    await persistBookmarksForOwnerWithClient(supabase, "x-user-1", [createTweet("222")]);

    const tweetCalls = calls.filter((call) => call.table === "tweets");
    expect(tweetCalls).toHaveLength(2);

    const firstRow = (tweetCalls[0].rows as Array<Record<string, unknown>>)[0];
    const secondRow = (tweetCalls[1].rows as Array<Record<string, unknown>>)[0];

    expect(firstRow).toHaveProperty("quoted_tweet");
    expect(firstRow).toHaveProperty("public_metrics");
    expect(secondRow).not.toHaveProperty("quoted_tweet");
    expect(secondRow).not.toHaveProperty("public_metrics");
  });

  it("throws and stops when tweet upsert fails with non-retryable error", async () => {
    const { supabase, calls } = createSupabaseMock({
      tweetsErrors: [{ message: "permission denied" }],
    });

    await expect(
      persistBookmarksForOwnerWithClient(supabase, "x-user-1", [createTweet("333")])
    ).rejects.toThrow("Failed to upsert canonical tweets");

    expect(calls.filter((call) => call.table === "collections")).toHaveLength(0);
    expect(calls.filter((call) => call.table === "collection_tweets")).toHaveLength(0);
  });

  it("retries collections upsert with legacy owner_x_user_id column when owner_user_id is missing", async () => {
    const { supabase, calls } = createSupabaseMock({
      collectionResults: [
        {
          data: null,
          error: { message: 'column "owner_user_id" of relation "collections" does not exist' },
        },
        { data: { id: "col-legacy" }, error: null },
      ],
    });

    const result = await persistBookmarksForOwnerWithClient(supabase, "x-user-1", [createTweet("444")]);

    const collectionCalls = calls.filter((call) => call.table === "collections");
    expect(collectionCalls).toHaveLength(2);
    expect(collectionCalls[0].rows).toEqual({
      owner_user_id: "x-user-1",
      name: "Bookmarks",
      slug: "bookmarks",
      visibility: "private",
      is_system: true,
    });
    expect(collectionCalls[0].options).toEqual({
      onConflict: "owner_user_id,slug",
      ignoreDuplicates: false,
    });

    expect(collectionCalls[1].rows).toEqual({
      owner_x_user_id: "x-user-1",
      name: "Bookmarks",
      slug: "bookmarks",
      visibility: "private",
      is_system: true,
    });
    expect(collectionCalls[1].options).toEqual({
      onConflict: "owner_x_user_id,slug",
      ignoreDuplicates: false,
    });

    expect(result.bookmarks_collection_id).toBe("col-legacy");
    expect(result.used_legacy_owner_column).toBe(true);
  });

  it("retries collections upsert with legacy owner_x_user_id when modern upsert returns empty error object", async () => {
    const { supabase, calls } = createSupabaseMock({
      collectionResults: [
        {
          data: null,
          error: {},
        },
        { data: { id: "col-empty-error-fallback" }, error: null },
      ],
    });

    const result = await persistBookmarksForOwnerWithClient(supabase, "x-user-1", [createTweet("555")]);

    const collectionCalls = calls.filter((call) => call.table === "collections");
    expect(collectionCalls).toHaveLength(2);
    expect(collectionCalls[0].options).toEqual({
      onConflict: "owner_user_id,slug",
      ignoreDuplicates: false,
    });
    expect(collectionCalls[1].options).toEqual({
      onConflict: "owner_x_user_id,slug",
      ignoreDuplicates: false,
    });
    expect(result.bookmarks_collection_id).toBe("col-empty-error-fallback");
    expect(result.used_legacy_owner_column).toBe(true);
  });

  it("throws actionable migration hint when collections upsert fails with opaque errors", async () => {
    const { supabase } = createSupabaseMock({
      collectionResults: [
        { data: null, error: {} },
        { data: null, error: {} },
      ],
    });

    await expect(
      persistBookmarksForOwnerWithClient(supabase, "x-user-1", [createTweet("666")])
    ).rejects.toThrow("Run supabase/sql/collections.sql");
  });
});
