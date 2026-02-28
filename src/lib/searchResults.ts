export interface SearchResultItem {
  id: string;
  content: string;
  similarity: number;
}

export function mergeSearchResults(
  keywordResults: SearchResultItem[],
  semanticResults: SearchResultItem[]
): SearchResultItem[] {
  const semanticById = new Map(semanticResults.map((item) => [item.id, item]));
  const merged: SearchResultItem[] = [];
  const seen = new Set<string>();

  for (const keywordItem of keywordResults) {
    const semanticVersion = semanticById.get(keywordItem.id);
    merged.push(semanticVersion ?? keywordItem);
    seen.add(keywordItem.id);
  }

  for (const semanticItem of semanticResults) {
    if (seen.has(semanticItem.id)) continue;
    merged.push(semanticItem);
    seen.add(semanticItem.id);
  }

  return merged;
}
