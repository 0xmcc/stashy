"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  availableTags: string[];
  selectedTags: string[];
}

export default function SearchBar({
  onSearch,
  onTagFilter,
  availableTags,
  selectedTags,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagFilter(selectedTags.filter((t) => t !== tag));
    } else {
      onTagFilter([...selectedTags, tag]);
    }
  };

  return (
    <div className="border-b border-[rgb(47,51,54)] px-4 py-3">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(113,118,123)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search tweets..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full bg-[rgb(32,35,39)] text-white placeholder-[rgb(113,118,123)] rounded-full py-2.5 pl-10 pr-4 text-sm border border-transparent focus:border-[rgb(29,155,240)] focus:bg-black focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[rgb(29,155,240)] text-white flex items-center justify-center text-xs hover:bg-[rgb(26,140,216)]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tag filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  isSelected
                    ? "bg-[rgb(29,155,240)] text-white"
                    : "bg-[rgb(32,35,39)] text-[rgb(113,118,123)] hover:bg-[rgb(47,51,54)]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
