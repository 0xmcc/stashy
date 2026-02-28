import { describe, expect, it } from "vitest";
import { mergeSearchResults } from "./searchResults";

describe("mergeSearchResults", () => {
  it("keeps fast keyword order and appends semantic-only matches", () => {
    const keywordResults = [
      { id: "a", content: "keyword a", similarity: 1 },
      { id: "b", content: "keyword b", similarity: 1 },
    ];
    const semanticResults = [
      { id: "b", content: "semantic b", similarity: 0.91 },
      { id: "c", content: "semantic c", similarity: 0.88 },
    ];

    expect(mergeSearchResults(keywordResults, semanticResults)).toEqual([
      { id: "a", content: "keyword a", similarity: 1 },
      { id: "b", content: "semantic b", similarity: 0.91 },
      { id: "c", content: "semantic c", similarity: 0.88 },
    ]);
  });
});
