// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import TweetCard from "./TweetCard";
import type { Tweet } from "../lib/supabase";

function baseTweet(): Tweet {
  return {
    id: 1,
    tweet_id: "tweet-1",
    tweet_text: "Hello world",
    author_handle: "marko",
    author_display_name: "Marko",
    author_avatar_url: null,
    timestamp: "2026-02-27T10:00:00.000Z",
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
  };
}

describe("TweetCard semantic selection UX", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as { React?: typeof React }).React = React;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("toggles selection when clicking tweet row in selectable mode", async () => {
    const onToggleSelect = vi.fn();
    const openSpy = vi.fn();
    vi.stubGlobal("open", openSpy);

    await act(async () => {
      root.render(
        <TweetCard tweet={baseTweet()} selectable selected onToggleSelect={onToggleSelect} />
      );
    });

    const card = container.querySelector("article");
    expect(card).not.toBeNull();

    await act(async () => {
      card?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onToggleSelect).toHaveBeenCalledWith("tweet-1");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("shows reduced opacity for non-selected rows in selectable mode", async () => {
    await act(async () => {
      root.render(<TweetCard tweet={baseTweet()} selectable selected={false} />);
    });

    const card = container.querySelector("article");
    expect(card?.className).toContain("opacity-50");
  });

  it("renders a dedicated source icon link", async () => {
    await act(async () => {
      root.render(<TweetCard tweet={baseTweet()} />);
    });

    const sourceLink = container.querySelector('a[aria-label="Open tweet source"]');
    expect(sourceLink).not.toBeNull();
    expect(sourceLink?.getAttribute("href")).toBe("https://x.com/marko/status/1");
  });
});
