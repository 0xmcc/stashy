import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-5";

function buildSystemPrompt({ retrievedItems, userVoiceExamples, firstTurn }) {
  const numberedItems = retrievedItems
    .map((item, index) => {
      const content = typeof item?.content === "string" ? item.content.trim() : "";
      const id = item?.id ? ` (id: ${item.id})` : "";
      return `[${index + 1}]${id}\n${content}`;
    })
    .join("\n\n");

  const voiceInstruction = userVoiceExamples.length
    ? `\n\nMatch the user's writing style using these examples:\n${userVoiceExamples
        .map((sample, index) => `Example ${index + 1}: ${sample}`)
        .join("\n")}`
    : "";

  const turnInstruction = firstTurn
    ? "This is the first turn. Draft one tweet grounded in the source items."
    : "This is a refinement turn. Revise based on user feedback while staying grounded in the source items.";

  return [
    "You are an AI writing collaborator for a corpus-backed writing workflow.",
    "Only use the retrieved corpus items below as source material. Do not use any outside knowledge.",
    "Every factual claim must be traceable to at least one numbered source item.",
    "Cite sources inline using bracketed numbers like [1] or [2][4].",
    "If a requested idea is not present in the source items, say that clearly.",
    turnInstruction,
    "\nRetrieved source items:\n",
    numberedItems,
    voiceInstruction,
  ]
    .join("\n")
    .trim();
}

function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter((msg) => msg && (msg.role === "user" || msg.role === "assistant"))
    .map((msg) => ({
      role: msg.role,
      content: typeof msg.content === "string" ? msg.content : String(msg.content || ""),
    }))
    .filter((msg) => msg.content.trim().length > 0);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body?.messages);
    const retrievedItems = Array.isArray(body?.retrievedItems) ? body.retrievedItems : [];
    const userVoiceExamples = Array.isArray(body?.userVoiceExamples)
      ? body.userVoiceExamples.filter((item) => typeof item === "string" && item.trim())
      : [];

    if (!retrievedItems.length) {
      return NextResponse.json(
        { error: "retrievedItems is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!messages.length) {
      return NextResponse.json(
        { error: "messages is required and cannot be empty" },
        { status: 400 }
      );
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const firstTurn = !messages.some((msg) => msg.role === "assistant");
    const systemPrompt = buildSystemPrompt({
      retrievedItems,
      userVoiceExamples,
      firstTurn,
    });

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json({ error: "LLM request failed" }, { status: 500 });
    }

    const data = await anthropicResponse.json();
    const content = Array.isArray(data?.content)
      ? data.content
          .filter((block) => block?.type === "text" && typeof block?.text === "string")
          .map((block) => block.text)
          .join("\n")
          .trim()
      : "";

    if (!content) {
      return NextResponse.json({ error: "Empty model response" }, { status: 500 });
    }

    return NextResponse.json({
      reply: {
        role: "assistant",
        content,
      },
    });
  } catch (error) {
    console.error("/api/chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
