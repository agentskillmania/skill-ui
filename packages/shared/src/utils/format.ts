/**
 * Format token counts into compact human-readable strings.
 * < 1000 → plain number; < 1M → "1.2k"（trim trailing ".0", >=100 取整）;
 * >= 1M → "1.5M". Returns "-" for undefined/null input.
 */
export function formatTokens(value: number | undefined): string {
  if (value == null) return '-';
  if (value < 1000) {
    return String(value);
  }
  if (value < 1_000_000) {
    const v = value / 1000;
    return `${v >= 100 ? Math.round(v) : trimOneDecimal(v)}k`;
  }
  const v = value / 1_000_000;
  return `${v >= 100 ? Math.round(v) : trimOneDecimal(v)}M`;
}

/** 一位小数并去掉尾随 ".0"：1.0 → "1"，1.5 → "1.5"。 */
function trimOneDecimal(v: number): string {
  return v.toFixed(1).replace(/\.0$/, '');
}

/**
 * Format a duration in milliseconds.
 * >= 1000ms → "X.Xs", otherwise "Xms".
 */
export function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}
