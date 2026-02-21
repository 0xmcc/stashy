import { useState, useEffect, useCallback, useRef } from "react";
import type { Tweet } from "../lib/supabase";
import { fetchTweets, fetchAllTags } from "../lib/supabase";
import { useXAuth } from "../contexts/XAuthContext";

interface BookmarksPayload {
    tweets: Tweet[];
    next_token: string | null;
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
        isChecking,
        isConnected,
    };
}
