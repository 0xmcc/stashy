"use client";

import { useEffect, useRef } from "react";
import type { Tweet } from "../lib/supabase";
import TweetCard from "./TweetCard";
import SearchBar from "./SearchBar";
import XConnectBanner from "./XConnectBanner";
import { useTweetFeed } from "../hooks/useTweetFeed";

interface TweetFeedProps {
  cardComponent?: React.ComponentType<{
    tweet: Tweet;
    onArticleClick?: (url: string, tweet: Tweet) => void;
  }>;
  dataSource?: "stash" | "bookmarks";
  onArticleClick?: (url: string, tweet: Tweet) => void;
}

export default function TweetFeed({
  cardComponent,
  dataSource = "stash",
  onArticleClick,
}: TweetFeedProps) {
  const CardComponent = cardComponent || TweetCard;
  const observerRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useTweetFeed(dataSource);

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const showConnectBanner = dataSource === "bookmarks" && !isChecking && !isConnected;

  return (
    <div>
      {dataSource === "stash" && (
        <SearchBar
          onSearch={setSearch}
          onTagFilter={setSelectedTags}
          availableTags={availableTags}
          selectedTags={selectedTags}
        />
      )}

      {showConnectBanner && <XConnectBanner />}

      {initialLoading && (
        <div className="divide-y divide-[rgb(47,51,54)]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse px-4 py-3">
              <div className="flex gap-3">
                <div className="h-12 w-12 shrink-0 rounded-full bg-[rgb(47,51,54)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-[rgb(47,51,54)]" />
                  <div className="h-3 w-full rounded bg-[rgb(47,51,54)]" />
                  <div className="h-3 w-2/3 rounded bg-[rgb(47,51,54)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!initialLoading && tweets.length === 0 && !showConnectBanner && (
        <div className="py-16 text-center text-[rgb(113,118,123)]">
          <svg
            className="mx-auto mb-3 h-10 w-10 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <p className="text-lg font-medium">No tweets found</p>
          <p className="mt-1 text-sm">
            {dataSource === "bookmarks"
              ? "No bookmarks returned from X"
              : search || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Saved tweets will appear here"}
          </p>
        </div>
      )}

      {!initialLoading &&
        tweets.map((tweet) => (
          <CardComponent
            key={tweet.tweet_id || tweet.id}
            tweet={tweet}
            onArticleClick={onArticleClick}
          />
        ))}

      <div ref={observerRef} className="h-1" />

      {loading && !initialLoading && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[rgb(29,155,240)] border-t-transparent" />
        </div>
      )}

      {!hasMore && tweets.length > 0 && (
        <div className="py-8 text-center text-sm text-[rgb(113,118,123)]">
          You&apos;ve reached the end
        </div>
      )}
    </div>
  );
}
