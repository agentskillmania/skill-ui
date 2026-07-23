import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatTokens,
  formatNumber,
  truncate,
  formatTimestamp,
} from '../../../src/utils/format.js';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "-" for undefined', () => {
    expect(formatRelativeTime(undefined)).toBe('-');
  });

  it('formats seconds ago as "just now"', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 30_000)).toBe('just now');
  });

  it('formats minutes ago', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 2 * 60 * 60 * 1000)).toBe('2h ago');
  });

  it('formats days ago', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 3 * 24 * 60 * 60 * 1000)).toBe('3d ago');
  });

  it('accepts ISO date string', () => {
    // 2026-06-10T11:55:00Z is 5 minutes before the faked now
    expect(formatRelativeTime('2026-06-10T11:55:00Z')).toBe('5m ago');
  });

  it('returns "-" for invalid date string', () => {
    expect(formatRelativeTime('not-a-date')).toBe('-');
  });

  it('sub-60s rounds to "just now"', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 59_999)).toBe('just now');
  });
});

describe('formatTokens', () => {
  it('returns "-" for undefined', () => {
    expect(formatTokens(undefined)).toBe('-');
  });

  it('formats millions with M suffix', () => {
    expect(formatTokens(1_500_000)).toBe('1.5M');
  });

  it('formats thousands with k suffix', () => {
    expect(formatTokens(3_400)).toBe('3.4k');
  });

  it('formats exact million', () => {
    expect(formatTokens(1_000_000)).toBe('1.0M');
  });

  it('formats exact thousand', () => {
    expect(formatTokens(1_000)).toBe('1.0k');
  });

  it('formats small numbers with locale string', () => {
    expect(formatTokens(42)).toBe('42');
  });

  it('formats zero', () => {
    expect(formatTokens(0)).toBe('0');
  });
});

describe('formatNumber', () => {
  it('returns "-" for undefined', () => {
    expect(formatNumber(undefined)).toBe('-');
  });

  it('formats number with locale', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('truncate', () => {
  it('returns text as-is when shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns text as-is when equal to max', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('formatTimestamp', () => {
  it('returns "-" for undefined', () => {
    expect(formatTimestamp(undefined)).toBe('-');
  });

  it('formats ISO string to M/D HH:mm', () => {
    // Use a non-UTC date string so the result is timezone-independent
    expect(formatTimestamp('2026-06-05T14:32:00')).toBe('6/5 14:32');
  });

  it('returns raw string for invalid date', () => {
    expect(formatTimestamp('not-a-date')).toBe('not-a-date');
  });
});
