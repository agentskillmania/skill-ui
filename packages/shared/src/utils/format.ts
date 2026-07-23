/**
 * Format a timestamp as a relative time string.
 * Accepts a unix timestamp (ms) or an ISO date string.
 * Returns "just now", "Xm ago", "Xh ago", or "Xd ago" relative to Date.now().
 * Returns "-" for undefined/null/invalid input.
 */
export function formatRelativeTime(timestamp: number | string | undefined): string {
  if (timestamp == null) return '-';
  const ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (Number.isNaN(ms)) return '-';
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
 * Format a duration in milliseconds.
 * >= 1000ms → "X.Xs", otherwise "Xms".
 */
export function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
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
