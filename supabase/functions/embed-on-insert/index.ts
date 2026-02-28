interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    id?: string | number;
    tweet_id?: string | null;
    tweet_text?: string | null;
  };
}

const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!openAiApiKey || !supabaseUrl || !serviceRoleKey) {
    return new Response("Missing required secrets.", { status: 500 });
  }

  let payload: WebhookPayload;

  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "tweets") {
    return Response.json({ ok: true, skipped: true, reason: "not_tweet_insert" });
  }

  const rowId = payload.record?.id;
  const tweetId = payload.record?.tweet_id?.trim();
  const content = payload.record?.tweet_text?.trim();

  if (!content || (!tweetId && (rowId === null || rowId === undefined))) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: "missing_tweet_identifier_or_text",
    });
  }

  try {
    const embedRes = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: content,
      }),
    });

    if (!embedRes.ok) {
      const details = await embedRes.text();
      return new Response(`Embedding request failed: ${details}`, { status: 500 });
    }

    const embedJson = await embedRes.json();
    const embedding = embedJson?.data?.[0]?.embedding;

    if (!embedding) {
      return new Response("No embedding returned from OpenAI.", { status: 500 });
    }

    const rowFilter = tweetId
      ? `tweet_id=eq.${encodeURIComponent(tweetId)}`
      : `id=eq.${encodeURIComponent(String(rowId))}`;
    const patchUrl = `${supabaseUrl}/rest/v1/tweets?${rowFilter}`;
    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ embedding }),
    });

    if (!patchRes.ok) {
      const patchDetails = await patchRes.text();
      return new Response(`Failed to update tweet embedding: ${patchDetails}`, {
        status: 500,
      });
    }

    return Response.json({ ok: true, tweetId: tweetId ?? String(rowId) });
  } catch (error) {
    return new Response(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      { status: 500 }
    );
  }
});
