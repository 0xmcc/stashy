import { NextResponse } from "next/server";
import { getSupabase, LinkCardData } from "@/lib/supabase";
import { toArray } from "@/lib/arrayGuards";

interface TweetRow {
  id: number;
  tweet_id: string;
  link_cards: LinkCardData[] | null;
}

const USER_AGENT =
  "Mozilla/5.0 (compatible; StashyCardEnricher/1.0; +https://example.com)";

function isEmpty(value: string | null | undefined): boolean {
  return !value || !value.trim();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(raw: string, base: string): string {
  if (!raw) return "";
  try {
    return new URL(raw, base).toString();
  } catch {
    return raw;
  }
}

function extractOgTag(html: string, key: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}

async function resolveFinalUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
    });

    return response.url || url;
  } catch (error) {
    console.warn("Failed to resolve URL, falling back to GET:", url, error);
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
    });

    return response.url || url;
  } catch (error) {
    console.error("Failed to resolve URL:", url, error);
    return url;
  }
}

async function fetchOpenGraph(url: string): Promise<{
  title: string;
  description: string;
  site_name: string;
  image: string;
}> {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { "user-agent": USER_AGENT },
  });

  const html = await response.text();
  const title = extractOgTag(html, "og:title");
  const description = extractOgTag(html, "og:description");
  const siteName = extractOgTag(html, "og:site_name");
  const image = extractOgTag(html, "og:image");

  return {
    title: stripHtml(title),
    description: stripHtml(description),
    site_name: stripHtml(siteName),
    image: toAbsoluteUrl(image, url),
  };
}

function shouldEnrich(card: LinkCardData): boolean {
  return isEmpty(card.title);
}

export async function POST() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("tweets")
    .select("id, tweet_id, link_cards")
    .eq("has_article", true);

  if (error) {
    console.error("Error fetching tweets for enrichment:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets." },
      { status: 500 }
    );
  }

  const tweets = (data ?? []) as TweetRow[];
  const summary = {
    scanned: tweets.length,
    enriched: 0,
    skipped: 0,
    failed: 0,
    details: [] as Array<{
      tweet_id: string;
      url: string;
      resolved_url: string;
      updated: boolean;
      reason?: string;
    }>,
  };

  for (const tweet of tweets) {
    const cards = toArray<LinkCardData>(tweet.link_cards);

    let didUpdate = false;
    const updatedCards: LinkCardData[] = [];

    for (const card of cards) {
      if (!shouldEnrich(card) || !card.url) {
        summary.skipped += 1;
        updatedCards.push({ ...card });
        summary.details.push({
          tweet_id: tweet.tweet_id,
          url: card.url,
          resolved_url: card.url,
          updated: false,
          reason: "already_enriched",
        });
        continue;
      }

      try {
        const resolvedUrl = await resolveFinalUrl(card.url);
        const og = await fetchOpenGraph(resolvedUrl);
        const enrichedCard: LinkCardData = {
          ...card,
          ...og,
          url: resolvedUrl || card.url,
        };

        updatedCards.push(enrichedCard);
        didUpdate = true;
        summary.enriched += 1;
        summary.details.push({
          tweet_id: tweet.tweet_id,
          url: card.url,
          resolved_url: resolvedUrl,
          updated: true,
        });
      } catch (err) {
        console.error("Failed to enrich link card:", card.url, err);
        summary.failed += 1;
        updatedCards.push({ ...card });
        summary.details.push({
          tweet_id: tweet.tweet_id,
          url: card.url,
          resolved_url: card.url,
          updated: false,
          reason: "enrichment_failed",
        });
      }
    }

    if (didUpdate) {
      const { error: updateError } = await supabase
        .from("tweets")
        .update({ link_cards: updatedCards })
        .eq("id", tweet.id);

      if (updateError) {
        console.error("Failed to update tweet cards:", tweet.id, updateError);
        summary.failed += 1;
      }
    }
  }

  return NextResponse.json(summary);
}
