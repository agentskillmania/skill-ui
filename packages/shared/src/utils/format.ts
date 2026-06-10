/**
 * Format a unix timestamp (ms) as a relative time string.
 * Returns "Xs ago", "Xm ago", or "Xh ago" relative to Date.now().
 * Returns "-" for undefined/null input.
 */
export function formatRelativeTime(timestamp: number | undefined): string {
  if (timestamp == null) return '-';
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * Format token counts into human-readable strings.
 * >= 1M → "X.XM", >= 1k → "X.Xk", otherwise locale number string.
 * Returns "-" for undefined/null input.
 */
export function formatTokens(value: number | undefined): string {
  if (value == null) return '-';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

/**
 * Format a number with locale formatting, or "-" for undefined.
 */
export function formatNumber(value: number | undefined): string {
  if (value == null) return '-';
  return value.toLocaleString();
}

/**
 * Truncate text to maxLength characters, appending "..." if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format an ISO timestamp to "M/D HH:mm" locale string.
 * Returns "-" for undefined. Returns raw string for invalid dates.
 */
export function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
