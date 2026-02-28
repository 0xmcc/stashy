import { describe, expect, it } from "vitest";
import { mapXBookmarksToTweets } from "./twitter";

describe("mapXBookmarksToTweets link metadata mapping", () => {
  it("maps t.co entities to unwound URL and uses metadata from X entities", () => {
    const tweets = mapXBookmarksToTweets(
      [
        {
          id: "123",
          text: "Interesting read https://t.co/abc123",
          author_id: "u1",
          entities: {
            urls: [
              {
                url: "https://t.co/abc123",
                expanded_url: "https://t.co/abc123",
                unwound_url: "https://example.com/blog/post",
                display_url: "example.com/blog/post",
                title: "A Real Article Title",
                description: "Short summary from X API entity.",
                images: [{ url: "https://example.com/cover.png" }],
              },
            ],
          },
        },
      ] as never,
      {
        users: [{ id: "u1", username: "marko", name: "Marko" }],
      } as never
    );

    expect(tweets).toHaveLength(1);
    expect(tweets[0].link_cards).toHaveLength(1);
    expect(tweets[0].link_cards[0]).toEqual({
      url: "https://example.com/blog/post",
      title: "A Real Article Title",
      description: "Short summary from X API entity.",
      image: "https://example.com/cover.png",
      site_name: "example.com",
    });
  });

  it("keeps unresolved t.co links as cards so they can be enriched later", () => {
    const tweets = mapXBookmarksToTweets(
      [
        {
          id: "123",
          text: "Link https://t.co/abc123",
          author_id: "u1",
          entities: {
            urls: [
              {
                url: "https://t.co/abc123",
                expanded_url: "https://t.co/abc123",
              },
            ],
          },
        },
      ] as never,
      {
        users: [{ id: "u1", username: "marko", name: "Marko" }],
      } as never
    );

    expect(tweets[0].link_cards).toHaveLength(1);
    expect(tweets[0].link_cards[0]).toMatchObject({
      url: "https://t.co/abc123",
      site_name: "t.co",
    });
  });

  it("maps x.com article links and uses top-level article title", () => {
    const tweets = mapXBookmarksToTweets(
      [
        {
          id: "2027463795355095314",
          text: "https://t.co/nKTDfC7zMm",
          author_id: "352806502",
          article: {
            title: "Lessons from Building Claude Code: Seeing like an Agent ",
          },
          entities: {
            urls: [
              {
                url: "https://t.co/nKTDfC7zMm",
                expanded_url: "http://x.com/i/article/2027446899310313472",
                unwound_url: "https://x.com/i/article/2027446899310313472",
                display_url: "x.com/i/article/2027...",
              },
            ],
          },
        },
      ] as never,
      {
        users: [{ id: "352806502", username: "noahvnct", name: "Noah Vincent" }],
      } as never
    );

    expect(tweets).toHaveLength(1);
    expect(tweets[0].link_cards).toHaveLength(1);
    expect(tweets[0].link_cards[0]).toEqual({
      url: "https://x.com/i/article/2027446899310313472",
      title: "Lessons from Building Claude Code: Seeing like an Agent",
      description: "",
      image: "",
      site_name: "x.com",
    });
  });
});
