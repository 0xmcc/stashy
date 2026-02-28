import type { LinkCardData, MediaItem, QuotedTweetData, Tweet } from "./supabase";

export interface XPublicMetrics {
  like_count: number;
  retweet_count: number;
  reply_count: number;
  bookmark_count: number;
  impression_count?: number;
}

export interface XTokens {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_at: number;
}

interface XUser {
  id: string;
  name?: string;
  username?: string;
  profile_image_url?: string;
}

interface XMedia {
  media_key: string;
  type?: "photo" | "video" | "animated_gif" | string;
  url?: string;
  preview_image_url?: string;
}

interface XUrlEntity {
  url?: string;
  expanded_url?: string;
  unwound_url?: string;
  display_url?: string;
  title?: string;
  description?: string;
  images?: Array<{ url?: string }>;
}

interface XReferencedTweet {
  id: string;
  type: "quoted" | "retweeted" | "replied_to" | string;
}

interface XArticle {
  title?: string;
  description?: string;
  image_url?: string;
}

interface XTweet {
  id: string;
  text?: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: XPublicMetrics;
  entities?: {
    urls?: XUrlEntity[];
  };
  article?: XArticle;
  attachments?: {
    media_keys?: string[];
  };
  referenced_tweets?: XReferencedTweet[];
  in_reply_to_user_id?: string;
  conversation_id?: string;
}

interface XIncludes {
  users?: XUser[];
  media?: XMedia[];
  tweets?: XTweet[];
}

function hashToNegativeInt(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return -Math.abs(hash || 1);
}

function toDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isTwitterUrl(url: string): boolean {
  const domain = toDomain(url);
  return domain === "x.com" || domain.endsWith(".x.com") || domain === "twitter.com" || domain.endsWith(".twitter.com") || domain === "t.co";
}

function isXArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return (host === "x.com" || host === "twitter.com") && parsed.pathname.startsWith("/i/article/");
  } catch {
    return false;
  }
}

function mapMedia(mediaKeys: string[] | undefined, mediaByKey: Map<string, XMedia>): MediaItem[] {
  if (!mediaKeys?.length) return [];

  return mediaKeys
    .map((key) => mediaByKey.get(key))
    .filter((item): item is XMedia => Boolean(item))
    .map((item) => {
      const mediaType = item.type === "photo" ? "image" : item.type === "animated_gif" ? "gif" : "video";
      return {
        type: mediaType,
        url: item.url || item.preview_image_url || "",
      } as MediaItem;
    })
    .filter((item) => Boolean(item.url));
}

function mapLinkCards(tweet: XTweet): LinkCardData[] {
  const urls = tweet.entities?.urls ?? [];

  return urls
    .map((entry) => {
      const targetUrl = entry.unwound_url || entry.expanded_url || entry.url;
      if (!targetUrl) return null;

      // Keep unresolved t.co links so downstream enrichment can resolve metadata.
      const isUnresolvedTco = toDomain(targetUrl) === "t.co";
      const isArticleUrl = isXArticleUrl(targetUrl);
      if (!isUnresolvedTco && isTwitterUrl(targetUrl) && !isArticleUrl) return null;

      const domain = toDomain(targetUrl);
      const title = entry.title?.trim() || tweet.article?.title?.trim() || entry.display_url || targetUrl;
      const description = entry.description?.trim() || tweet.article?.description?.trim() || "";
      const image = entry.images?.[0]?.url || tweet.article?.image_url || "";
      return {
        url: targetUrl,
        title,
        description,
        image,
        site_name: domain,
      } as LinkCardData;
    })
    .filter((card): card is LinkCardData => Boolean(card));
}

function mapPublicMetrics(metrics: XPublicMetrics | undefined): Tweet["public_metrics"] {
  if (!metrics) return undefined;
  return {
    like_count: metrics.like_count ?? 0,
    retweet_count: metrics.retweet_count ?? 0,
    reply_count: metrics.reply_count ?? 0,
    bookmark_count: metrics.bookmark_count ?? 0,
    impression_count: metrics.impression_count,
  };
}

function mapQuotedTweet(
  quotedRef: XReferencedTweet | undefined,
  quotedTweetsById: Map<string, XTweet>,
  usersById: Map<string, XUser>,
  mediaByKey: Map<string, XMedia>
): QuotedTweetData | null {
  if (!quotedRef || quotedRef.type !== "quoted") return null;

  const quoted = quotedTweetsById.get(quotedRef.id);
  if (!quoted) return null;

  const author = quoted.author_id ? usersById.get(quoted.author_id) : undefined;
  const handle = author?.username || null;

  return {
    tweet_id: quoted.id,
    tweet_text: quoted.text || "",
    author_handle: handle || "unknown",
    author_display_name: author?.name || "Unknown",
    author_avatar_url: author?.profile_image_url || "",
    timestamp: quoted.created_at || null,
    source_url: handle ? `https://x.com/${handle}/status/${quoted.id}` : `https://x.com/i/status/${quoted.id}`,
    media: mapMedia(quoted.attachments?.media_keys, mediaByKey),
    link_cards: mapLinkCards(quoted),
  };
}

export function mapXBookmarksToTweets(data: XTweet[] = [], includes: XIncludes = {}): Tweet[] {
  const usersById = new Map((includes.users ?? []).map((user) => [user.id, user]));
  const mediaByKey = new Map((includes.media ?? []).map((media) => [media.media_key, media]));
  const quotedTweetsById = new Map((includes.tweets ?? []).map((tweet) => [tweet.id, tweet]));

  return data.map((tweet) => {
    const author = tweet.author_id ? usersById.get(tweet.author_id) : undefined;
    const handle = author?.username || null;
    const quotedRef = tweet.referenced_tweets?.find((item) => item.type === "quoted");

    return {
      id: hashToNegativeInt(tweet.id),
      tweet_id: tweet.id,
      tweet_text: tweet.text || null,
      author_handle: handle,
      author_display_name: author?.name || null,
      author_avatar_url: author?.profile_image_url || null,
      timestamp: tweet.created_at || null,
      source_url: handle ? `https://x.com/${handle}/status/${tweet.id}` : `https://x.com/i/status/${tweet.id}`,
      media: mapMedia(tweet.attachments?.media_keys, mediaByKey),
      link_cards: mapLinkCards(tweet),
      quoted_tweet_id: quotedRef?.id || null,
      quoted_tweet: mapQuotedTweet(quotedRef, quotedTweetsById, usersById, mediaByKey),
      in_reply_to_tweet_id: tweet.in_reply_to_user_id || null,
      conversation_id: tweet.conversation_id || null,
      raw_json: tweet as unknown as Record<string, unknown>,
      tags: [],
      notes: null,
      saved_at: null,
      created_at: null,
      public_metrics: mapPublicMetrics(tweet.public_metrics),
    } satisfies Tweet;
  });
}

/**
 * Re-derive link cards from a stored raw X API tweet JSON object.
 * Used as a fallback when persisted link_cards are empty (e.g. tweets
 * stored before link card extraction was added).
 */
export function deriveLinkCardsFromRawJson(rawJson: unknown): LinkCardData[] {
  if (!rawJson || typeof rawJson !== "object") return [];

  try {
    const mapped = mapXBookmarksToTweets(
      [rawJson] as Parameters<typeof mapXBookmarksToTweets>[0],
      {}
    );
    return Array.isArray(mapped[0]?.link_cards) ? mapped[0].link_cards : [];
  } catch {
    return [];
  }
}
