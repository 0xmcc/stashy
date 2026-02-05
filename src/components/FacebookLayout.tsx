"use client";

import { ReactNode, useState } from "react";
import { useView } from "../contexts/ViewContext";

/* ─── SVG icon helpers ─── */
function FBLogo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg className={`w-6 h-6 ${active ? "text-[rgb(66,133,244)]" : "text-[rgb(176,179,184)]"}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.464 3.09c1.262-1.12 3.21-1.12 4.472 0l5.6 4.977c.783.696 1.228 1.706 1.228 2.766V19.5A1.75 1.75 0 0 1 19.014 21.25h-3.278a1.75 1.75 0 0 1-1.75-1.75v-3.75a.25.25 0 0 0-.25-.25H10.264a.25.25 0 0 0-.25.25v3.75a1.75 1.75 0 0 1-1.75 1.75H4.986A1.75 1.75 0 0 1 3.236 19.5v-8.667c0-1.06.445-2.07 1.228-2.766l5-4.977z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="w-6 h-6 text-[rgb(176,179,184)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function MarketplaceIcon() {
  return (
    <svg className="w-6 h-6 text-[rgb(176,179,184)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
  );
}

function GroupsIcon() {
  return (
    <svg className="w-6 h-6 text-[rgb(176,179,184)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function GamingIcon() {
  return (
    <svg className="w-6 h-6 text-[rgb(176,179,184)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.491 48.491 0 0 0-4.163.3c-1.11.143-1.931 1.082-1.931 2.2V10.5M21.75 12a2.25 2.25 0 0 0-2.25-2.25H15a2.25 2.25 0 0 0-2.25 2.25M21.75 12v7.5m0-7.5V12a2.25 2.25 0 0 0-2.25-2.25H15a2.25 2.25 0 0 0-2.25 2.25m0 0V21m0-9v-1.5m0 1.5v7.5m0-7.5h-3M3 12h3m3 0V9.5M9 12v7.5m0-7.5H6M3 12v7.5m0-7.5V10.5m0 9h18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── Sidebar menu items ─── */
const sidebarItems = [
  {
    label: "News Feed",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 11.382V20h5v-5a3 3 0 0 1 6 0v5h5v-8.618l-8-6.545-8 6.545ZM12 2.45l10 8.182V22H14v-7a1 1 0 0 0-2 0v7H2V10.632l10-8.182Z" />
      </svg>
    ),
  },
  {
    label: "Watch",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    label: "Marketplace",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72" />
      </svg>
    ),
  },
  {
    label: "Groups",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    label: "Events",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "Memories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    label: "Saved",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 2a2 2 0 0 0-2 2v16l7-3 7 3V4a2 2 0 0 0-2-2H5Z" />
      </svg>
    ),
    active: true,
  },
  {
    label: "Pages",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
];

/* ─── Fake contacts ─── */
const contacts = [
  { name: "Elon Musk", online: true },
  { name: "Mark Zuckerberg", online: true },
  { name: "Naval Ravikant", online: false },
  { name: "Sahil Bloom", online: true },
  { name: "Paul Graham", online: false },
  { name: "Sam Altman", online: true },
  { name: "Balaji Srinivasan", online: false },
  { name: "Lex Fridman", online: true },
];

/* ─── Story data ─── */
const stories = [
  { label: "Create story", isCreate: true },
  { label: "Elon Musk", color: "from-blue-600 to-purple-600" },
  { label: "Naval", color: "from-pink-500 to-orange-500" },
  { label: "Paul G.", color: "from-green-500 to-teal-500" },
  { label: "Sam A.", color: "from-yellow-500 to-red-500" },
];

/* ─── Main Component ─── */
export default function FacebookLayout({ children }: { children: ReactNode }) {
  const { setView } = useView();
  const [seeMore, setSeeMore] = useState(false);

  const visibleItems = seeMore ? sidebarItems : sidebarItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-[rgb(24,25,26)]">
      {/* ══════════ TOP NAVBAR ══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[rgb(36,37,38)] border-b border-[rgb(58,59,60)] flex items-center px-4 gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <FBLogo className="w-10 h-10 text-[rgb(66,133,244)]" />
        </div>

        {/* Search */}
        <div className="hidden sm:flex items-center bg-[rgb(58,59,60)] rounded-full px-3 py-2 ml-2 w-[240px]">
          <SearchIcon className="w-4 h-4 text-[rgb(176,179,184)] shrink-0" />
          <input
            type="text"
            placeholder="Search Facebook"
            className="bg-transparent text-white placeholder-[rgb(176,179,184)] text-sm ml-2 outline-none w-full"
          />
        </div>

        {/* Center nav icons (desktop) */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-1">
          {[
            { icon: <HomeIcon active />, label: "Home", active: true },
            { icon: <VideoIcon />, label: "Video" },
            { icon: <MarketplaceIcon />, label: "Marketplace" },
            { icon: <GroupsIcon />, label: "Groups" },
            { icon: <GamingIcon />, label: "Gaming" },
          ].map((item) => (
            <button
              key={item.label}
              className={`relative flex items-center justify-center w-[112px] h-12 rounded-lg transition-colors ${
                item.active
                  ? "text-[rgb(66,133,244)]"
                  : "text-[rgb(176,179,184)] hover:bg-[rgb(58,59,60)]"
              }`}
              title={item.label}
            >
              {item.icon}
              {item.active && (
                <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-[rgb(66,133,244)] rounded-t-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Switch to Twitter button */}
          <button
            onClick={() => setView("twitter")}
            className="flex items-center gap-1.5 bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] text-white rounded-full px-3 py-1.5 transition-colors text-sm font-medium"
            title="Switch to Twitter view"
          >
            <XLogo className="w-4 h-4" />
            <span className="hidden sm:inline">Twitter</span>
          </button>

          {/* Menu dot */}
          <button className="w-10 h-10 rounded-full bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-[rgb(228,230,235)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" />
            </svg>
          </button>

          {/* Messenger */}
          <button className="w-10 h-10 rounded-full bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-[rgb(228,230,235)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.24.16.15.26.36.27.58l.05 1.82c.02.56.6.92 1.1.69l2.03-.9c.17-.07.36-.1.55-.06.89.24 1.84.37 2.85.37 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2Zm5.99 7.59-2.93 4.65c-.47.74-1.44.93-2.13.41l-2.33-1.75a.6.6 0 0 0-.72 0L7.4 14.78c-.39.3-.9-.18-.64-.6l2.93-4.65c.47-.74 1.44-.93 2.13-.41l2.33 1.75a.6.6 0 0 0 .72 0l2.48-1.88c.39-.3.9.18.64.6Z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 rounded-full bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-[rgb(228,230,235)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a7.49 7.49 0 0 0-7.5 7.5c0 3.08-1.13 4.55-1.97 5.44a.75.75 0 0 0 .56 1.31h17.82a.75.75 0 0 0 .56-1.31c-.84-.89-1.97-2.36-1.97-5.44A7.49 7.49 0 0 0 12 2ZM9 20.25a3 3 0 0 0 6 0H9Z" />
            </svg>
          </button>

          {/* Avatar */}
          <button className="w-10 h-10 rounded-full bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] flex items-center justify-center transition-colors overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              S
            </div>
          </button>
        </div>
      </header>

      {/* ══════════ LEFT SIDEBAR ══════════ */}
      <aside className="hidden xl:block fixed left-0 top-14 bottom-0 w-[300px] overflow-y-auto bg-[rgb(24,25,26)] pt-4 pb-8 px-2 scrollbar-thin">
        {/* Profile */}
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            S
          </div>
          <span className="text-white text-[15px] font-medium">Saved Tweets</span>
        </button>

        {/* Menu items */}
        {visibleItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              item.active
                ? "bg-[rgb(58,59,60)] text-white"
                : "text-[rgb(228,230,235)] hover:bg-[rgb(58,59,60)]"
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              item.active ? "bg-[rgb(66,133,244)] text-white" : "text-[rgb(176,179,184)]"
            }`}>
              {item.icon}
            </div>
            <span className="text-[15px] font-medium">{item.label}</span>
          </button>
        ))}

        {/* See more / less */}
        <button
          onClick={() => setSeeMore(!seeMore)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors text-[rgb(228,230,235)]"
        >
          <div className="w-9 h-9 rounded-full bg-[rgb(58,59,60)] flex items-center justify-center shrink-0">
            <svg className={`w-4 h-4 text-[rgb(176,179,184)] transition-transform ${seeMore ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <span className="text-[15px] font-medium">{seeMore ? "See less" : "See more"}</span>
        </button>

        {/* Divider */}
        <div className="mx-2 my-3 border-t border-[rgb(58,59,60)]" />

        {/* Shortcuts heading */}
        <div className="px-2 py-1">
          <span className="text-[rgb(176,179,184)] text-[15px] font-semibold">Your shortcuts</span>
        </div>
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors text-[rgb(228,230,235)]">
          <div className="w-9 h-9 rounded-lg bg-[rgb(58,59,60)] flex items-center justify-center shrink-0">
            <FBLogo className="w-5 h-5 text-[rgb(66,133,244)]" />
          </div>
          <span className="text-[15px] font-medium">Tweet Saver</span>
        </button>

        {/* Footer */}
        <div className="px-4 mt-6 text-[rgb(104,108,112)] text-xs leading-5">
          Privacy · Terms · Advertising · Ad Choices · Cookies · More · Meta © 2025
        </div>
      </aside>

      {/* ══════════ RIGHT SIDEBAR ══════════ */}
      <aside className="hidden xl:block fixed right-0 top-14 bottom-0 w-[280px] overflow-y-auto bg-[rgb(24,25,26)] pt-4 pb-8 px-4 scrollbar-thin">
        {/* Sponsored */}
        <div className="mb-4">
          <h3 className="text-[rgb(176,179,184)] text-[17px] font-semibold mb-3">Sponsored</h3>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors cursor-pointer">
            <div className="w-[130px] h-[130px] rounded-lg bg-[rgb(58,59,60)] shrink-0 flex items-center justify-center overflow-hidden">
              <div className="text-[rgb(176,179,184)] text-xs text-center px-2">Ad content</div>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Tweet Saver Pro</p>
              <p className="text-[rgb(176,179,184)] text-xs">tweetsaver.app</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgb(58,59,60)] my-3" />

        {/* Contacts */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[rgb(176,179,184)] text-[17px] font-semibold">Contacts</h3>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full hover:bg-[rgb(58,59,60)] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-[rgb(176,179,184)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-[rgb(58,59,60)] flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-[rgb(176,179,184)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
            </button>
          </div>
        </div>

        {contacts.map((contact) => (
          <button
            key={contact.name}
            className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-[rgb(58,59,60)] flex items-center justify-center text-white text-sm font-bold">
                {contact.name.charAt(0)}
              </div>
              {contact.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[rgb(24,25,26)]" />
              )}
            </div>
            <span className="text-[rgb(228,230,235)] text-[15px]">{contact.name}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="border-t border-[rgb(58,59,60)] my-3" />

        {/* Group conversations */}
        <h3 className="text-[rgb(176,179,184)] text-[17px] font-semibold mb-3">Group conversations</h3>
        <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors">
          <div className="w-9 h-9 rounded-full bg-[rgb(58,59,60)] flex items-center justify-center text-[rgb(176,179,184)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[rgb(228,230,235)] text-[15px]">Create new group</span>
        </button>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="pt-14 xl:ml-[300px] xl:mr-[280px] min-h-screen">
        <div className="max-w-[680px] mx-auto px-4 py-6">
          {/* Stories row */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            {stories.map((story, i) => (
              <div key={i} className="shrink-0 w-[112px] cursor-pointer group">
                <div className={`relative h-[200px] w-full rounded-xl overflow-hidden ${
                  story.isCreate
                    ? "bg-[rgb(36,37,38)] border border-[rgb(58,59,60)]"
                    : `bg-gradient-to-br ${story.color}`
                }`}>
                  {story.isCreate ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center pb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          S
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-[rgb(36,37,38)] border-t border-[rgb(58,59,60)] pt-6 pb-3 flex flex-col items-center">
                        <div className="absolute -top-4 w-8 h-8 rounded-full bg-[rgb(66,133,244)] flex items-center justify-center border-[3px] border-[rgb(36,37,38)]">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </div>
                        <span className="text-white text-xs font-medium mt-1">Create story</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-3 left-3">
                        <div className="w-10 h-10 rounded-full border-[3px] border-[rgb(66,133,244)] bg-[rgb(58,59,60)] flex items-center justify-center text-white text-xs font-bold">
                          {story.label.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-white text-xs font-medium drop-shadow-lg">{story.label}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create post box */}
          <div className="bg-[rgb(36,37,38)] rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                S
              </div>
              <button className="flex-1 text-left bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] rounded-full px-4 py-2.5 text-[rgb(176,179,184)] text-[15px] transition-colors">
                What&apos;s on your mind?
              </button>
            </div>
            <div className="border-t border-[rgb(58,59,60)] mt-3 pt-3 flex items-center">
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[rgb(176,179,184)] text-sm font-medium">Live video</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[rgb(176,179,184)] text-sm font-medium">Photo/video</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-[rgb(58,59,60)] transition-colors">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[rgb(176,179,184)] text-sm font-medium">Feeling/activity</span>
              </button>
            </div>
          </div>

          {/* Feed content */}
          {children}
        </div>
      </main>

      {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgb(36,37,38)] border-t border-[rgb(58,59,60)] flex items-center h-14">
        <button className="flex-1 flex flex-col items-center justify-center h-full text-[rgb(66,133,244)] relative">
          <HomeIcon active />
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[rgb(66,133,244)]" />
        </button>
        <button className="flex-1 flex items-center justify-center h-full">
          <VideoIcon />
        </button>
        <button className="flex-1 flex items-center justify-center h-full">
          <MarketplaceIcon />
        </button>
        <button className="flex-1 flex items-center justify-center h-full">
          <GroupsIcon />
        </button>
        <button
          onClick={() => setView("twitter")}
          className="flex-1 flex flex-col items-center justify-center h-full text-[rgb(176,179,184)]"
        >
          <XLogo className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Twitter</span>
        </button>
      </nav>
    </div>
  );
}
