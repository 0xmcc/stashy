"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import TweetFeed from "../components/TweetFeed";
import LeftSidebar from "../components/LeftSidebar";
import TweetCard from "../components/TweetCard";
import FacebookCard from "../components/FacebookCard";
import FacebookLayout from "../components/FacebookLayout";
import SubstackLayout from "../components/SubstackLayout";
import UpgradeBanner from "../components/UpgradeBanner";
import PricingModal from "../components/PricingModal";
import OnboardingModal from "../components/OnboardingModal";
import ArticleReaderView from "../components/ArticleReaderView";
import SemanticSearch from "../components/SemanticSearch";
import type { Tweet } from "../lib/supabase";
import { useView } from "../contexts/ViewContext";
import { XAuthProvider, useXAuth } from "../contexts/XAuthContext";

export const dynamic = "force-dynamic";

import { SuccessToast } from "../components/SuccessToast";
import { DataSourceToggle, type DataSource } from "../components/DataSourceToggle";

interface SemanticResultItem {
  id: string;
  content: string;
  similarity: number;
}

function HomeContent() {
  const { view } = useView();
  const { checkStatus } = useXAuth();
  const searchParams = useSearchParams();
  const [showPricing, setShowPricing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticResultItem[]>([]);
  const [semanticSelectedIds, setSemanticSelectedIds] = useState<string[]>([]);
  const [semanticCorpusIds, setSemanticCorpusIds] = useState<string[]>([]);
  const [semanticAutoSelectAll, setSemanticAutoSelectAll] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("stash");
  const [articleUrl, setArticleUrl] = useState<string | null>(null);
  const [articleTweet, setArticleTweet] = useState<Tweet | null>(null);

  const isDigest = view === "digest";
  const isFacebook = view === "facebook";

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const upgraded = searchParams.get("upgraded") === "true";
    const cancelled = searchParams.get("cancelled") === "true";
    const xConnected = searchParams.get("xConnected");

    if (upgraded) {
      setShowSuccess(true);
    }

    if (xConnected === "1") {
      setDataSource("bookmarks");
      checkStatus();
    }

    if (upgraded || cancelled || xConnected === "1" || xConnected === "0") {
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams, checkStatus]);

  const handleOnboardingClose = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  const twitterTitle = useMemo(
    () => (dataSource === "bookmarks" ? "X Bookmarks" : "Saved Tweets"),
    [dataSource]
  );

  const handleArticleClick = (url: string, tweet: Tweet) => {
    setArticleUrl(url);
    setArticleTweet(tweet);
  };

  const closeArticleReader = () => {
    setArticleUrl(null);
    setArticleTweet(null);
  };

  const handleSourceChange = (nextSource: DataSource) => {
    setDataSource(nextSource);
    closeArticleReader();
    setSemanticResults([]);
    setSemanticSelectedIds([]);
    setSemanticCorpusIds([]);
    setSemanticAutoSelectAll(true);
  };

  const toggleSemanticSelection = (tweetId: string) => {
    if (semanticAutoSelectAll) {
      setSemanticAutoSelectAll(false);
      setSemanticSelectedIds(semanticCorpusIds.filter((id) => id !== tweetId));
      return;
    }

    setSemanticAutoSelectAll(false);
    setSemanticSelectedIds((prev) =>
      prev.includes(tweetId) ? prev.filter((id) => id !== tweetId) : [...prev, tweetId]
    );
  };

  const selectAllSemantic = (ids?: string[]) => {
    setSemanticAutoSelectAll(true);
    setSemanticSelectedIds(ids ?? semanticCorpusIds);
  };

  const deselectAllSemantic = () => {
    setSemanticAutoSelectAll(false);
    setSemanticSelectedIds([]);
  };

  const semanticFilterIds = useMemo(
    () => semanticResults.map((item) => item.id),
    [semanticResults]
  );

  const semanticSimilarityById = useMemo(() => {
    const byId: Record<string, number> = {};
    semanticResults.forEach((item) => {
      byId[item.id] = item.similarity;
    });
    return byId;
  }, [semanticResults]);

  const effectiveSemanticSelectedIds = useMemo(
    () => (semanticAutoSelectAll ? semanticCorpusIds : semanticSelectedIds),
    [semanticAutoSelectAll, semanticCorpusIds, semanticSelectedIds]
  );

  return (
    <>
      {showSuccess && <SuccessToast onDismiss={() => setShowSuccess(false)} />}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />

      <main className="min-h-screen">
        <LeftSidebar onShowOnboarding={() => setShowOnboarding(true)} />

        {isDigest ? (
          <div className="pb-16 transition-all duration-200 md:ml-[68px] md:pb-0 lg:ml-[240px]">
            <SubstackLayout />
          </div>
        ) : isFacebook ? (
          <div className="pb-16 transition-all duration-200 md:ml-[68px] md:pb-0 lg:ml-[240px]">
            <FacebookLayout>
              <TweetFeed cardComponent={FacebookCard} dataSource="stash" />
              <UpgradeBanner onLearnMore={() => setShowPricing(true)} />
            </FacebookLayout>
          </div>
        ) : (
          <div className="pb-16 transition-all duration-200 md:ml-[68px] md:pb-0 lg:ml-[240px]">
            <div
              className="mx-auto max-w-[1040px] xl:grid xl:grid-cols-[600px_440px]"
            >
              <div className="min-h-screen border-x border-[rgb(47,51,54)]">
                <header className="sticky top-0 z-10 border-b border-[rgb(47,51,54)] bg-black/80 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <h1 className="text-xl font-bold text-white">{twitterTitle}</h1>
                  </div>
                </header>

                <DataSourceToggle value={dataSource} onChange={handleSourceChange} />

                <TweetFeed
                  cardComponent={TweetCard}
                  dataSource={dataSource}
                  onArticleClick={handleArticleClick}
                  semanticFilterIds={semanticFilterIds}
                  semanticSelectedIds={effectiveSemanticSelectedIds}
                  onToggleSemanticSelect={toggleSemanticSelection}
                  semanticSimilarityById={semanticSimilarityById}
                  onSelectAllSemantic={selectAllSemantic}
                  onDeselectAllSemantic={deselectAllSemantic}
                  onSemanticCorpusIdsChange={setSemanticCorpusIds}
                  semanticAutoSelectAll={semanticAutoSelectAll}
                />

                <UpgradeBanner onLearnMore={() => setShowPricing(true)} />

                <div className="border-t border-[rgb(47,51,54)] xl:hidden">
                  <SemanticSearch
                    results={semanticResults}
                    selectedIds={effectiveSemanticSelectedIds}
                    onResultsChange={setSemanticResults}
                    onSelectedIdsChange={(ids) => {
                      setSemanticAutoSelectAll(false);
                      setSemanticSelectedIds(ids);
                    }}
                  />
                </div>
              </div>

              <aside className="hidden xl:block">
                <SemanticSearch
                  results={semanticResults}
                  selectedIds={effectiveSemanticSelectedIds}
                  onResultsChange={setSemanticResults}
                  onSelectedIdsChange={(ids) => {
                    setSemanticAutoSelectAll(false);
                    setSemanticSelectedIds(ids);
                  }}
                />
              </aside>
            </div>
          </div>
        )}
      </main>

      {articleUrl && (
        <ArticleReaderView
          articleUrl={articleUrl}
          tweet={articleTweet}
          onClose={closeArticleReader}
        />
      )}

    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <XAuthProvider>
        <HomeContent />
      </XAuthProvider>
    </Suspense>
  );
}
