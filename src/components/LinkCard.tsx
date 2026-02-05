"use client";

import { useState } from "react";
import type { LinkCardData } from "../lib/supabase";

interface LinkCardProps {
  card: LinkCardData;
}

export default function LinkCard({ card }: LinkCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!card.url) return null;

  const domain = (() => {
    try {
      return new URL(card.url).hostname.replace(/^www\./, "");
    } catch {
      return card.site_name || card.url;
    }
  })();

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block rounded-2xl border border-[rgb(47,51,54)] overflow-hidden hover:bg-[rgb(30,33,38)] transition-colors"
    >
      {card.image && !imgFailed && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={card.image}
          alt={card.title || "Link preview"}
          className="w-full h-[200px] object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="px-3 py-2">
        <div className="text-[rgb(113,118,123)] text-sm truncate">
          {domain}
        </div>
        {card.title && (
          <div className="text-white text-sm mt-0.5 line-clamp-2">
            {card.title}
          </div>
        )}
        {card.description && (
          <div className="text-[rgb(113,118,123)] text-sm mt-0.5 line-clamp-2">
            {card.description}
          </div>
        )}
      </div>
    </a>
  );
}
