import TweetFeed from "../components/TweetFeed";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-[600px] mx-auto border-x border-[rgb(47,51,54)] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-[rgb(47,51,54)] px-4 py-3">
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
        <TweetFeed />
      </div>
    </main>
  );
}
