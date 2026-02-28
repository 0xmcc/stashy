#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
    console.error(
      "Missing required env vars: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_KEY, OPENAI_API_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const openai = new OpenAI({ apiKey: openaiApiKey });

  const pageSize = 200;
  let totalProcessed = 0;
  let totalFailed = 0;
  let batchNumber = 0;

  while (true) {
    const { data: rows, error } = await supabase
      .from("tweets")
      .select("tweet_id, tweet_text")
      .is("embedding", null)
      .not("tweet_text", "is", null)
      .neq("tweet_text", "")
      .order("tweet_id", { ascending: true })
      .range(0, pageSize - 1);

    if (error) {
      console.error("Failed to fetch tweets batch:", error.message);
      break;
    }

    if (!rows || rows.length === 0) {
      break;
    }

    batchNumber += 1;
    console.log(`Fetched batch ${batchNumber}: ${rows.length} rows.`);

    for (const row of rows) {
      const tweetId = row.tweet_id;
      const content = typeof row.tweet_text === "string" ? row.tweet_text : "";

      if (!content) {
        console.log(`[${tweetId}] Skipping: invalid tweet_text.`);
        continue;
      }

      try {
        let embeddingResponse = null;
        let attempts = 0;

        while (!embeddingResponse && attempts < 4) {
          attempts += 1;
          try {
            embeddingResponse = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: content,
            });
          } catch (embedErr) {
            const message =
              embedErr instanceof Error ? embedErr.message : String(embedErr);
            const isRateLimited = message.includes("429");
            if (!isRateLimited || attempts >= 4) {
              throw embedErr;
            }
            const waitMs = attempts * 1500;
            console.warn(
              `[${tweetId}] Rate limited (attempt ${attempts}/4). Retrying in ${waitMs}ms.`
            );
            await sleep(waitMs);
          }
        }

        const embedding = embeddingResponse?.data?.[0]?.embedding;

        if (!embedding) {
          totalFailed += 1;
          console.error(`[${tweetId}] Failed: no embedding returned.`);
          continue;
        }

        const { error: updateError } = await supabase
          .from("tweets")
          .update({ embedding })
          .eq("tweet_id", tweetId);

        if (updateError) {
          totalFailed += 1;
          console.error(`[${tweetId}] Failed to update row:`, updateError.message);
          continue;
        }

        totalProcessed += 1;
        console.log(`[${tweetId}] Embedded and updated (${totalProcessed} total).`);
      } catch (err) {
        totalFailed += 1;
        console.error(
          `[${tweetId}] Embedding error:`,
          err instanceof Error ? err.message : err
        );
      }
    }
  }

  console.log(
    `Done. Successfully processed ${totalProcessed} rows. Failed ${totalFailed} rows.`
  );
}

main().catch((err) => {
  console.error("Fatal error in embed-corpus script:", err);
  process.exit(1);
});
