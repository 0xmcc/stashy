"use client";

import { useXAuth } from "../contexts/XAuthContext";

export type DataSource = "stash" | "bookmarks";

export function DataSourceToggle({
    value,
    onChange,
}: {
    value: DataSource;
    onChange: (value: DataSource) => void;
}) {
    const { isConnected, xHandle, isChecking } = useXAuth();

    return (
        <div className="border-b border-[rgb(47,51,54)] px-4 py-3">
            <div className="inline-flex rounded-full bg-[rgb(22,24,28)] p-1">
                <button
                    type="button"
                    onClick={() => onChange("stash")}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${value === "stash"
                            ? "bg-[rgb(29,155,240)] text-white"
                            : "text-[rgb(113,118,123)] hover:text-white"
                        }`}
                >
                    My Stash
                </button>
                <button
                    type="button"
                    onClick={() => onChange("bookmarks")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${value === "bookmarks"
                            ? "bg-[rgb(29,155,240)] text-white"
                            : "text-[rgb(113,118,123)] hover:text-white"
                        }`}
                >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X Bookmarks
                </button>
            </div>

            <div className="mt-2 text-xs text-[rgb(113,118,123)]">
                {isChecking ? (
                    <span>Checking X connection...</span>
                ) : isConnected ? (
                    <div className="flex items-center gap-2">
                        <span>Connected {xHandle ? `as @${xHandle}` : "to X"}</span>
                        <form action="/api/auth/twitter/disconnect" method="post">
                            <button className="rounded-full border border-[rgb(47,51,54)] px-2 py-0.5 text-[11px] font-medium text-[rgb(113,118,123)] hover:border-[rgb(90,94,98)] hover:text-white">
                                Disconnect
                            </button>
                        </form>
                    </div>
                ) : (
                    <span>Not connected</span>
                )}
            </div>
        </div>
    );
}
