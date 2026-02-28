/**
 * Safely coerce a potentially-non-array DB value into a typed array.
 * Use this wherever JSON/JSONB columns might return null instead of [].
 */
export function toArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
