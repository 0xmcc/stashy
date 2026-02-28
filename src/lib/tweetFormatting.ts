/**
 * Format a numeric engagement metric for compact display.
 * - undefined / 0 → "0"
 * - ≥ 1,000,000 → "1.5M" (trailing .0 stripped)
 * - ≥ 1,000 → "1.5K" (trailing .0 stripped)
 * - otherwise → String(value)
 */
export function formatMetric(value: number | undefined): string {
  if (value === undefined) return "0";
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000)
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}
