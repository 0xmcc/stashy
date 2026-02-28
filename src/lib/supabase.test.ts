import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("fetchTweetById", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("uses maybeSingle to avoid 406 when tweet row is missing", async () => {
    const maybeSingleMock = vi.fn(async () => ({ data: null, error: null }));
    const singleMock = vi.fn(async () => ({
      data: null,
      error: { message: "JSON object requested, multiple (or no) rows returned" },
    }));

    const eqMock = vi.fn(() => ({
      maybeSingle: maybeSingleMock,
      single: singleMock,
    }));

    const selectMock = vi.fn(() => ({
      eq: eqMock,
    }));

    const fromMock = vi.fn(() => ({
      select: selectMock,
    }));

    createClientMock.mockReturnValue({
      from: fromMock,
    });

    const { fetchTweetById } = await import("./supabase");
    await fetchTweetById("missing-tweet-id");

    expect(maybeSingleMock).toHaveBeenCalledTimes(1);
    expect(singleMock).not.toHaveBeenCalled();
  });
});

describe("fetchTweets", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("derives article link cards from raw_json when persisted link_cards are empty", async () => {
    const rangeMock = vi.fn(async () => ({
      data: [
        {
          id: 10,
          tweet_id: "tweet-article-1",
          tweet_text: "https://t.co/7B7PDa1RqB",
          author_handle: "nateliason",
          author_display_name: "Nat Eliason",
          author_avatar_url: null,
          timestamp: "2026-02-02T15:53:37.000Z",
          source_url: "https://x.com/nateliason/status/tweet-article-1",
          media: [],
          link_cards: [],
          quoted_tweet_id: null,
          quoted_tweet: null,
          in_reply_to_tweet_id: null,
          conversation_id: "tweet-article-1",
          raw_json: {
            id: "2018352113860927648",
            text: "https://t.co/7B7PDa1RqB",
            article: {
              title: "Bring Your Own Agent: The Future of AI-Powered Apps",
            },
            entities: {
              urls: [
                {
                  url: "https://t.co/7B7PDa1RqB",
                  expanded_url: "http://x.com/i/article/2018347415263117312",
                  unwound_url: "https://x.com/i/article/2018347415263117312",
                  display_url: "x.com/i/article/2018...",
                },
              ],
            },
          },
          tags: [],
          notes: null,
          saved_at: null,
          created_at: null,
        },
      ],
      error: null,
    }));

    const queryMock = {
      order: vi.fn(() => ({
        range: rangeMock,
      })),
      or: vi.fn(() => queryMock),
      overlaps: vi.fn(() => queryMock),
      range: rangeMock,
    };

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => queryMock),
    }));

    createClientMock.mockReturnValue({
      from: fromMock,
    });

    const { fetchTweets } = await import("./supabase");
    const result = await fetchTweets(0);

    expect(result.tweets).toHaveLength(1);
    expect(result.tweets[0].link_cards).toHaveLength(1);
    expect(result.tweets[0].link_cards[0]).toEqual({
      url: "https://x.com/i/article/2018347415263117312",
      title: "Bring Your Own Agent: The Future of AI-Powered Apps",
      description: "",
      image: "",
      site_name: "x.com",
    });
  });
});
