// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useTweetFeed } from "./useTweetFeed";

const {
  checkStatusMock,
  fetchTweetsMock,
  fetchAllTagsMock,
} = vi.hoisted(() => ({
  checkStatusMock: vi.fn(),
  fetchTweetsMock: vi.fn(),
  fetchAllTagsMock: vi.fn(),
}));

vi.mock("../contexts/XAuthContext", () => ({
  useXAuth: () => ({
    isConnected: true,
    isChecking: false,
    checkStatus: checkStatusMock,
  }),
}));

vi.mock("../lib/supabase", () => ({
  fetchTweets: fetchTweetsMock,
  fetchAllTags: fetchAllTagsMock,
}));

function HookHarness() {
  const { refreshBookmarks, bookmarkSyncStatus } = useTweetFeed("bookmarks");
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void refreshBookmarks();
        }}
      >
        Sync
      </button>
      <p data-testid="status-summary">{bookmarkSyncStatus?.summary || ""}</p>
    </div>
  );
}

describe("useTweetFeed bookmarks sync", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.restoreAllMocks();
    checkStatusMock.mockReset();
    fetchTweetsMock.mockReset();
    fetchAllTagsMock.mockReset();
    fetchAllTagsMock.mockResolvedValue([]);

    class IntersectionObserverMock {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    (globalThis as { React?: typeof React }).React = React;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  it("calls sync endpoint before reloading bookmarks feed", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/twitter/bookmarks/sync") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            status: "ok",
            fetched_count: 1,
            persisted_count: 1,
            canonical_upserted: 1,
            bookmarks_collection_id: "col-1",
            retried_without_optional_fields: false,
            used_legacy_owner_column: false,
            next_token: null,
          }),
        });
      }

      if (url.startsWith("/api/twitter/bookmarks")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ tweets: [], next_token: null }),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      root.render(<HookHarness />);
    });

    // Ignore initial automatic bookmarks load on mount.
    fetchMock.mockClear();

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("Sync");

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/twitter/bookmarks/sync");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" });
    expect(String(fetchMock.mock.calls[1][0])).toBe("/api/twitter/bookmarks");
    expect(container.textContent).toContain("Synced 1 from X. Persisted 1 collection entries.");
  });
});
