"use client";

import React, { useMemo, useRef, useState } from "react";
import { mergeSearchResults } from "../lib/searchResults";

function extractCitedIndexes(text) {
  if (typeof text !== "string") return [];

  const matches = [...text.matchAll(/\[(\d+)\]/g)];
  const numbers = matches
    .map((match) => Number(match[1]))
    .filter((n) => Number.isInteger(n) && n > 0);

  return [...new Set(numbers)];
}

export default function SemanticSearch({
  results,
  selectedIds,
  onResultsChange,
  onSelectedIdsChange,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [refiningLoading, setRefiningLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const activeSearchIdRef = useRef(0);

  const selectedItems = useMemo(
    () => (results || []).filter((item) => (selectedIds || []).includes(item.id)),
    [results, selectedIds]
  );

  const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant")?.content || "";

  const indexById = useMemo(() => {
    const map = new Map();
    (results || []).forEach((item, idx) => map.set(item.id, idx + 1));
    return map;
  }, [results]);

  async function fetchSearchResults(trimmedQuery, mode) {
    const response = await fetch(`/api/search?mode=${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmedQuery }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Search failed");
    }

    return Array.isArray(data?.results) ? data.results : [];
  }

  async function runSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchLoading(true);
    setRefiningLoading(false);
    setError("");
    const currentSearchId = activeSearchIdRef.current + 1;
    activeSearchIdRef.current = currentSearchId;

    try {
      const keywordResults = await fetchSearchResults(trimmed, "keyword");
      if (activeSearchIdRef.current !== currentSearchId) return;

      onResultsChange(keywordResults);
      onSelectedIdsChange(keywordResults.map((item) => item.id));
      setMessages([]);
      setChatInput("");
      setSearchLoading(false);

      setRefiningLoading(true);
      const semanticResults = await fetchSearchResults(trimmed, "semantic");
      if (activeSearchIdRef.current !== currentSearchId) return;

      const mergedResults = mergeSearchResults(keywordResults, semanticResults);
      onResultsChange(mergedResults);
      onSelectedIdsChange(mergedResults.map((item) => item.id));
    } catch (err) {
      if (activeSearchIdRef.current !== currentSearchId) return;
      setError(err instanceof Error ? err.message : "Search failed");
      onResultsChange([]);
      onSelectedIdsChange([]);
      setMessages([]);
    } finally {
      if (activeSearchIdRef.current === currentSearchId) {
        setSearchLoading(false);
        setRefiningLoading(false);
      }
    }
  }

  async function requestChat(nextMessages) {
    setChatLoading(true);
    setError("");

    try {
      const contextItems = selectedItems.length ? selectedItems : results;

      if (!contextItems || contextItems.length === 0) {
        throw new Error("retrievedItems is required and cannot be empty");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          retrievedItems: contextItems,
          userVoiceExamples: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Chat request failed");
      }

      if (!data?.reply?.content) {
        throw new Error("Empty response from AI");
      }

      setMessages([...nextMessages, data.reply]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages(nextMessages);
    } finally {
      setChatLoading(false);
    }
  }

  async function writeFromSelected() {
    if (!selectedItems.length || chatLoading) return;

    const selectedNumbers = selectedItems
      .map((item) => indexById.get(item.id))
      .filter(Boolean)
      .map((n) => `[${n}]`)
      .join(", ");

    const prompt = `Draft one tweet using only these selected corpus items: ${selectedNumbers}. Cite sources inline.`;
    const nextMessages = [{ role: "user", content: prompt }];
    setMessages(nextMessages);
    await requestChat(nextMessages);
  }

  async function sendRefinement(event) {
    event.preventDefault();
    const trimmed = chatInput.trim();

    if (!trimmed || chatLoading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setChatInput("");
    await requestChat(nextMessages);
  }

  function clearSemantic() {
    activeSearchIdRef.current += 1;
    onResultsChange([]);
    onSelectedIdsChange([]);
    setMessages([]);
    setChatInput("");
    setError("");
    setSearchLoading(false);
    setRefiningLoading(false);
  }

  function saveToCollection() {
    const sourceIndexes = extractCitedIndexes(latestAssistantMessage);
    const sourceItemIds = sourceIndexes
      .map((idx) => (results || [])[idx - 1]?.id)
      .filter(Boolean);

    console.log({
      tweetContent: latestAssistantMessage,
      sourceItemIds,
    });
  }

  const hasResults = (results || []).length > 0;

  return (
    <div className="min-h-screen border-l border-[rgb(47,51,54)] bg-black">
      <div className="sticky top-0 z-10 border-b border-[rgb(47,51,54)] bg-black/80 px-4 py-3 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white">Semantic Search + AI Collaborator</h2>
          {typeof onClose === "function" ? (
            <button
              onClick={onClose}
              className="rounded-full border border-[rgb(47,51,54)] px-3 py-1 text-xs font-semibold text-white hover:bg-[rgb(8,10,13)]"
            >
              Close
            </button>
          ) : null}
        </div>

        <form onSubmit={runSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe a concept..."
            className="w-full rounded-full border border-[rgb(47,51,54)] bg-black px-4 py-2 text-sm text-white placeholder:text-[rgb(113,118,123)] focus:border-[rgb(29,155,240)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {error ? (
          <p className="mt-3 rounded-xl border border-[rgb(244,33,46)] bg-[rgba(244,33,46,0.08)] px-3 py-2 text-sm text-[rgb(255,120,132)]">
            {error}
          </p>
        ) : null}

        {hasResults ? (
          <p className="mt-3 text-xs text-[rgb(113,118,123)]">
            Filtering {(results || []).length} tweets. {(selectedIds || []).length} selected for chat context.
            {refiningLoading ? " Refining with semantic results..." : ""}
          </p>
        ) : (
          <p className="mt-3 text-xs text-[rgb(113,118,123)]">
            Search to filter the timeline. Select/deselect directly on tweet rows.
          </p>
        )}
      </div>

      <div className="border-b border-[rgb(47,51,54)] px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={writeFromSelected}
            disabled={!selectedItems.length || chatLoading}
            className="rounded-full bg-[rgb(29,155,240)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {chatLoading ? "Generating..." : "Write tweet from selected"}
          </button>
          <button
            onClick={clearSemantic}
            disabled={!hasResults}
            className="rounded-full border border-[rgb(47,51,54)] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(8,10,13)] disabled:opacity-60"
          >
            Clear filter
          </button>
        </div>
      </div>

      <form onSubmit={sendRefinement} className="border-b border-[rgb(47,51,54)] px-4 py-3">
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="ask a question or request a draft..."
            className="w-full rounded-full border border-[rgb(47,51,54)] bg-black px-4 py-2 text-sm text-white placeholder:text-[rgb(113,118,123)] focus:border-[rgb(29,155,240)] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={chatLoading || !chatInput.trim()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {chatLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      {messages.map((msg, idx) => {
        const isAssistant = msg.role === "assistant";
        const cited = extractCitedIndexes(msg.content);
        return (
          <article
            key={`${idx}-${msg.content.slice(0, 20)}`}
            className="border-b border-[rgb(47,51,54)] px-4 py-3"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(113,118,123)]">
              {isAssistant ? "AI" : "You"}
            </p>
            <p className="mb-2 whitespace-pre-wrap text-[15px] leading-6 text-white">{msg.content}</p>
            {isAssistant ? (
              <p className="text-xs text-[rgb(113,118,123)]">
                Sources: {cited.length ? cited.map((n) => `[${n}]`).join(", ") : "No citations found"}
              </p>
            ) : null}
          </article>
        );
      })}

      <div className="px-4 py-3">
        <button
          onClick={saveToCollection}
          disabled={!latestAssistantMessage}
          className="rounded-full border border-[rgb(47,51,54)] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(8,10,13)] disabled:opacity-60"
        >
          Save to collection
        </button>
      </div>
    </div>
  );
}
