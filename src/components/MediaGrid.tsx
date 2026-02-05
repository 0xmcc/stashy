"use client";

import { useState } from "react";
import type { MediaItem } from "../lib/supabase";

interface MediaGridProps {
  media: MediaItem[];
}

function MediaTile({ item }: { item: MediaItem }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  if (item.type === "video") {
    return (
      <div className="relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[rgb(29,155,240)] bg-opacity-90 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "gif") {
    return (
      <div className="relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt="GIF"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          GIF
        </div>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={item.url}
      alt="Tweet media"
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function MediaGrid({ media }: MediaGridProps) {
  if (!media || media.length === 0) return null;

  const count = media.length;

  if (count === 1) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)] max-h-[512px]">
        <MediaTile item={media[0]} />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)] grid grid-cols-2 gap-0.5 max-h-[288px]">
        {media.map((item, i) => (
          <div key={i} className="overflow-hidden h-[288px]">
            <MediaTile item={item} />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)] grid grid-cols-2 gap-0.5 max-h-[288px]">
        <div className="row-span-2 overflow-hidden h-[288px]">
          <MediaTile item={media[0]} />
        </div>
        <div className="overflow-hidden h-[143px]">
          <MediaTile item={media[1]} />
        </div>
        <div className="overflow-hidden h-[143px]">
          <MediaTile item={media[2]} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)] grid grid-cols-2 gap-0.5 max-h-[288px]">
      {media.slice(0, 4).map((item, i) => (
        <div key={i} className="overflow-hidden h-[143px]">
          <MediaTile item={item} />
        </div>
      ))}
    </div>
  );
}
