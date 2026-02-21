"use client";

import { ReactNode, useState, useEffect } from "react";
import { useView } from "../contexts/ViewContext";

import {
  FBLogo,
  HomeIcon,
  VideoIcon,
  MarketplaceIcon,
  GroupsIcon,
  GamingIcon,
  SearchIcon,
  XLogo,
  SidebarToggleIcon,
  sidebarItems,
  contacts
} from "./FacebookLayoutData";

/* ─── Main Component ─── */
export default function FacebookLayout({ children, goProButton }: { children: ReactNode; goProButton?: ReactNode }) {
  const { setView } = useView();
  const [showSidebars, setShowSidebars] = useState(true);
  const [seeMore, setSeeMore] = useState(false);

  // Load sidebar preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("fb-sidebars-visible");
    if (stored !== null) {
      setShowSidebars(stored === "true");
    }
  }, []);

  // Save sidebar preference to localStorage
  useEffect(() => {
    localStorage.setItem("fb-sidebars-visible", String(showSidebars));
  }, [showSidebars]);

  const visibleItems = seeMore ? sidebarItems : sidebarItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-[rgb(24,25,26)]">
      {/* ══════════ TOP NAVBAR ══════════ */}
      <header className="fixed top-0 left-0 md:left-[68px] lg:left-[240px] right-0 z-40 h-14 bg-[rgb(36,37,38)] border-b border-[rgb(58,59,60)] flex items-center px-4 gap-2 transition-all duration-200">
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
              className={`relative flex items-center justify-center w-[112px] h-12 rounded-lg transition-colors ${item.active
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
          {/* Go Pro button */}
          {goProButton}

          {/* Toggle sidebars button */}
          <button
            onClick={() => setShowSidebars(!showSidebars)}
            className={`hidden xl:flex items-center justify-center w-10 h-10 rounded-full transition-colors ${showSidebars
                ? "bg-[rgb(66,133,244)] text-white"
                : "bg-[rgb(58,59,60)] hover:bg-[rgb(70,72,74)] text-[rgb(228,230,235)]"
              }`}
            title="Toggle sidebars"
          >
            <SidebarToggleIcon className="w-5 h-5" />
          </button>

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

      {/* ══════════ FB LEFT SIDEBAR ══════════ */}
      {showSidebars && (
        <aside className="hidden xl:block fixed left-[68px] lg:left-[240px] top-14 bottom-0 w-[300px] overflow-y-auto bg-[rgb(24,25,26)] pt-4 pb-8 px-2 scrollbar-thin z-30">
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
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${item.active
                  ? "bg-[rgb(58,59,60)] text-white"
                  : "text-[rgb(228,230,235)] hover:bg-[rgb(58,59,60)]"
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.active ? "bg-[rgb(66,133,244)] text-white" : "text-[rgb(176,179,184)]"
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
      )}

      {/* ══════════ FB RIGHT SIDEBAR ══════════ */}
      {showSidebars && (
        <aside className="hidden xl:block fixed right-0 top-14 bottom-0 w-[280px] overflow-y-auto bg-[rgb(24,25,26)] pt-4 pb-8 px-4 scrollbar-thin z-30">
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
      )}

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className={`pt-14 min-h-screen transition-all duration-200 ${showSidebars ? "xl:ml-[300px] xl:mr-[280px]" : ""}`}>
        <div className="max-w-[680px] mx-auto px-4 py-6">
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

      {/* Mobile bottom nav handled by LeftSidebar */}
    </div>
  );
}
