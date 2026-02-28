// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import TweetFeed from "./TweetFeed";
import type { Tweet } from "../lib/supabase";

vi.mock("../hooks/useTweetFeed", () => ({
  useTweetFeed: () => ({
    tweets: [
      {
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
      } satisfies Tweet,
    ],
    loading: false,
    initialLoading: false,
    hasMore: false,
    search: "",
    setSearch: vi.fn(),
    selectedTags: [],
    setSelectedTags: vi.fn(),
    availableTags: [],
    loadMore: vi.fn(),
    refreshBookmarks: vi.fn(),
    bookmarkSyncStatus: null,
    isChecking: false,
    isConnected: true,
  }),
}));

describe("TweetFeed semantic controls", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as { React?: typeof React }).React = React;
    class IntersectionObserverMock {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("renders semantic controls without requiring a search filter", async () => {
    const onSelectAllSemantic = vi.fn();
    const onDeselectAllSemantic = vi.fn();

    await act(async () => {
      root.render(
        <TweetFeed
          semanticSelectedIds={[]}
          onToggleSemanticSelect={vi.fn()}
          onSelectAllSemantic={onSelectAllSemantic}
          onDeselectAllSemantic={onDeselectAllSemantic}
        />
      );
    });

    const selectAllButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Select all"
    );
    const deselectAllButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Deselect all"
    );

    expect(selectAllButton).not.toBeNull();
    expect(deselectAllButton).not.toBeNull();

    await act(async () => {
      selectAllButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onDeselectAllSemantic).toHaveBeenCalledTimes(0);
    expect(onSelectAllSemantic).toHaveBeenCalledTimes(1);
    expect(onSelectAllSemantic).toHaveBeenCalledWith(["tweet-1"]);
  });
});
