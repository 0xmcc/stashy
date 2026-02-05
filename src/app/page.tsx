"use client";

import TweetFeed from "../components/TweetFeed";
import LeftSidebar from "../components/LeftSidebar";
import TweetCard from "../components/TweetCard";
import FacebookCard from "../components/FacebookCard";
import FacebookLayout from "../components/FacebookLayout";
import { useView } from "../contexts/ViewContext";

export const dynamic = "force-dynamic";

export default function Home() {
  const { view } = useView();
  const isFacebook = view === "facebook";

  /* ─── Facebook view: full immersive layout ─── */
  if (isFacebook) {
    return (
      <FacebookLayout>
        <TweetFeed cardComponent={FacebookCard} />
      </FacebookLayout>
    );
  }

  /* ─── Twitter view: unchanged ─── */
  return (
    <main className="min-h-screen">
      <LeftSidebar />

      {/* Main content area — offset for sidebar on md+ */}
      <div className="md:ml-[68px] lg:ml-[240px] transition-all duration-200 pb-16 md:pb-0">
        <div className="mx-auto min-h-screen max-w-[600px] border-x border-[rgb(47,51,54)]">
          {/* Header */}
          <header className="sticky top-0 z-10 backdrop-blur-md border-b border-[rgb(47,51,54)] px-4 py-3 bg-black/80">
            <div className="flex items-center gap-3">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <h1 className="text-xl font-bold text-white">Saved Tweets</h1>
            </div>
          </header>

          {/* Feed */}
          <TweetFeed cardComponent={TweetCard} />
        </div>
      </div>
    </main>
  );
}
