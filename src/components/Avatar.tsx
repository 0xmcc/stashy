"use client";

import { useState } from "react";
import { getInitials } from "../lib/utils";

interface AvatarProps {
  url: string | null;
  name: string | null;
  size?: number;
}

export default function Avatar({ url, name, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = getInitials(name);

  if (!url || failed) {
    return (
      <div
        className="rounded-full flex items-center justify-center bg-[rgb(29,155,240)] text-white font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt={name ?? "avatar"}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
