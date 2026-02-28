import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function shouldUseDirectKeywordSearch(query) {
  if (typeof query !== "string") return false;
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (trimmed.length > 64) return false;

  // Keep direct path strict to avoid malformed filter expressions.
  if (!/^[a-zA-Z0-9@#._\-\s]+$/.test(trimmed)) return false;

  return trimmed.split(/\s+/).length <= 4;
}

function buildIlikeTerm(query) {
  return `%${query.trim().replace(/[%_]/g, "\\$&")}%`;
}

function normalizeMode(modeParam) {
  if (modeParam === "keyword" || modeParam === "semantic") return modeParam;
  return "auto";
}

function getRequiredEnv() {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing required env vars: OPENAI_API_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  return { openaiApiKey, supabaseUrl, supabaseServiceKey };
}

async function runKeywordSearch(supabase, query) {
  const term = buildIlikeTerm(query);
  const { data, error } = await supabase
    .from("tweets")
    .select("tweet_id, tweet_text, author_handle")
    .or(`tweet_text.ilike.${term},author_handle.ilike.${term}`)
    .limit(15);

  if (error) {
    return { error };
  }

  return {
    results: (data || []).map((row) => ({
      id: row.tweet_id,
      content: row.tweet_text,
      similarity: 1,
    })),
  };
}

async function runSemanticSearch(openaiApiKey, supabase, query) {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query.trim(),
  });

  const queryEmbedding = embeddingResponse.data?.[0]?.embedding;

  if (!queryEmbedding) {
    return { error: new Error("Failed to generate query embedding") };
  }

  const { data, error } = await supabase.rpc("match_tweets", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: 15,
  });

  if (error) {
    return { error };
  }

  return {
    results: (data || []).map((row) => ({
      id: row.id,
      content: row.content,
      similarity: row.similarity,
    })),
  };
}

export async function POST(request) {
  try {
    const { query } = await request.json();
    const url = new URL(request.url);
    const mode = normalizeMode(url.searchParams.get("mode"));

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const { openaiApiKey, supabaseUrl, supabaseServiceKey } = getRequiredEnv();

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const useKeyword =
      mode === "keyword" || (mode === "auto" && shouldUseDirectKeywordSearch(query));

    if (useKeyword) {
      const directResult = await runKeywordSearch(supabase, query);
      if (directResult.error) {
        console.error("Direct keyword search error:", directResult.error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
      }
      return NextResponse.json({ results: directResult.results });
    }

    const semanticResult = await runSemanticSearch(openaiApiKey, supabase, query);
    if (semanticResult.error) {
      console.error("Semantic search error:", semanticResult.error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
    return NextResponse.json({ results: semanticResult.results });
  } catch (error) {
    console.error("/api/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
