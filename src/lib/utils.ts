/**
 * Format a date string into a relative timestamp.
 * - Less than 1 minute: "just now"
 * - Less than 1 hour: "Xm"
 * - Less than 24 hours: "Xh"
 * - Same year: "Mon DD"
 * - Different year: "Mon DD, YYYY"
 */
export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();

  if (date.getFullYear() === now.getFullYear()) {
    return `${month} ${day}`;
  }

  return `${month} ${day}, ${date.getFullYear()}`;
}

/**
 * Detect URLs in text and return an array of segments
 * (either plain text or a URL).
 */
export interface TextSegment {
  type: "text" | "url";
  content: string;
}

const URL_REGEX =
  /https?:\/\/[^\s<>"']+/g;

export function parseTextWithUrls(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, matchStart) });
    }
    // Trim trailing punctuation that's likely not part of URL
    let url = match[0];
    const trailingPunct = /[.,;:!?)]+$/.exec(url);
    if (trailingPunct) {
      url = url.slice(0, -trailingPunct[0].length);
    }
    segments.push({ type: "url", content: url });
    lastIndex = matchStart + url.length;
    URL_REGEX.lastIndex = lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Get initials from a display name for avatar fallback.
 */
export function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
