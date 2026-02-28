import { useState, useEffect, useCallback, useRef } from "react";
import type { Tweet } from "../lib/supabase";
import { fetchTweets, fetchAllTags } from "../lib/supabase";
import { useXAuth } from "../contexts/XAuthContext";

interface BookmarksPayload {
    tweets: Tweet[];
    next_token: string | null;
}

interface BookmarkSyncSuccessPayload {
    status: "ok";
    fetched_count: number;
    persisted_count: number;
    canonical_upserted: number;
    bookmarks_collection_id: string;
    retried_without_optional_fields: boolean;
    used_legacy_owner_column: boolean;
    next_token: string | null;
}

interface BookmarkSyncErrorPayload {
    error: string;
    details?: string;
}

interface BookmarkSyncStatus {
    state: "syncing" | "success" | "error";
    summary: string;
    fetchedCount?: number;
    persistedCount?: number;
    canonicalUpserted?: number;
    bookmarksCollectionId?: string;
    retriedWithoutOptionalFields?: boolean;
    usedLegacyOwnerColumn?: boolean;
    errorDetails?: string;
    updatedAt: string;
}

export function useTweetFeed(dataSource: "stash" | "bookmarks") {
    const { isConnected, isChecking, checkStatus } = useXAuth();

    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [page, setPage] = useState(0);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [bookmarkSyncStatus, setBookmarkSyncStatus] = useState<BookmarkSyncStatus | null>(null);

    const searchRef = useRef(search);
    const tagsRef = useRef(selectedTags);

    searchRef.current = search;
    tagsRef.current = selectedTags;

    useEffect(() => {
        fetchAllTags().then(setAvailableTags);
    }, []);

    const loadStashTweets = useCallback(
        async (pageNum: number, searchQuery: string, tags: string[], append: boolean) => {
            setLoading(true);
            const result = await fetchTweets(pageNum, searchQuery, tags);
            setTweets((prev) => (append ? [...prev, ...result.tweets] : result.tweets));
            setHasMore(result.hasMore);
            setLoading(false);
            setInitialLoading(false);
        },
        []
    );

    const loadBookmarkTweets = useCallback(async (cursorToken: string | null, append: boolean) => {
        setLoading(true);
        try {
            const url = cursorToken
                ? `/api/twitter/bookmarks?cursor=${encodeURIComponent(cursorToken)}`
                : "/api/twitter/bookmarks";

            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                if (response.status === 401) {
                    setTweets((prev) => (append ? prev : []));
                    setHasMore(false);
                    await checkStatus();
                }
                setLoading(false);
                setInitialLoading(false);
                return;
            }

            const payload = (await response.json()) as BookmarksPayload;
            setTweets((prev) => (append ? [...prev, ...payload.tweets] : payload.tweets));
            setCursor(payload.next_token || null);
            setHasMore(Boolean(payload.next_token));
        } catch (error) {
            console.error("Failed to load X bookmarks:", error);
            if (!append) setTweets([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [checkStatus]);

    useEffect(() => {
        if (dataSource !== "stash") return;

        setPage(0);
        setCursor(null);
        setTweets([]);
        setHasMore(true);
        setInitialLoading(true);
        loadStashTweets(0, search, selectedTags, false);
    }, [dataSource, search, selectedTags, loadStashTweets]);

    useEffect(() => {
        if (dataSource !== "bookmarks") return;
        checkStatus();
    }, [dataSource, checkStatus]);

    useEffect(() => {
        if (dataSource !== "bookmarks") return;

        setPage(0);
        setCursor(null);
        setTweets([]);

        if (isChecking) {
            setInitialLoading(true);
            return;
        }

        if (!isConnected) {
            setHasMore(false);
            setInitialLoading(false);
            return;
        }

        setHasMore(true);
        setInitialLoading(true);
        loadBookmarkTweets(null, false);
    }, [dataSource, isConnected, isChecking, loadBookmarkTweets]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;

        if (dataSource === "stash") {
            const nextPage = page + 1;
            setPage(nextPage);
            loadStashTweets(nextPage, searchRef.current, tagsRef.current, true);
            return;
        }

        if (!isConnected || !cursor) return;
        loadBookmarkTweets(cursor, true);
    }, [loading, hasMore, dataSource, page, loadStashTweets, isConnected, cursor, loadBookmarkTweets]);

    const refreshBookmarks = useCallback(async () => {
        if (dataSource !== "bookmarks" || !isConnected) return;
        setPage(0);
        setCursor(null);
        setHasMore(true);
        setInitialLoading(true);
        setBookmarkSyncStatus({
            state: "syncing",
            summary: "Syncing bookmarks from X and persisting to database...",
            updatedAt: new Date().toISOString(),
        });
        try {
            const syncResponse = await fetch("/api/twitter/bookmarks/sync", {
                method: "POST",
                cache: "no-store",
            });
            const payload = (await syncResponse.json()) as
                | BookmarkSyncSuccessPayload
                | BookmarkSyncErrorPayload;

            if (!syncResponse.ok) {
                setBookmarkSyncStatus({
                    state: "error",
                    summary: payload.error || "Bookmark sync failed.",
                    errorDetails:
                        "details" in payload && payload.details ? payload.details : undefined,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                const success = payload as BookmarkSyncSuccessPayload;
                setBookmarkSyncStatus({
                    state: "success",
                    summary: `Synced ${success.fetched_count} from X. Persisted ${success.persisted_count} collection entries.`,
                    fetchedCount: success.fetched_count,
                    persistedCount: success.persisted_count,
                    canonicalUpserted: success.canonical_upserted,
                    bookmarksCollectionId: success.bookmarks_collection_id,
                    retriedWithoutOptionalFields: success.retried_without_optional_fields,
                    usedLegacyOwnerColumn: success.used_legacy_owner_column,
                    updatedAt: new Date().toISOString(),
                });
            }

            if (!syncResponse.ok && syncResponse.status === 401) {
                await checkStatus();
            }
        } catch (error) {
            console.error("Failed to sync bookmarks from X:", error);
            setBookmarkSyncStatus({
                state: "error",
                summary: "Bookmark sync request failed.",
                errorDetails: error instanceof Error ? error.message : "Unknown error",
                updatedAt: new Date().toISOString(),
            });
        }
        await loadBookmarkTweets(null, false);
    }, [dataSource, isConnected, loadBookmarkTweets, checkStatus]);

    return {
        tweets,
        loading,
        initialLoading,
        hasMore,
        search,
        setSearch,
        selectedTags,
        setSelectedTags,
        availableTags,
        loadMore,
        refreshBookmarks,
        bookmarkSyncStatus,
        isChecking,
        isConnected,
    };
}
