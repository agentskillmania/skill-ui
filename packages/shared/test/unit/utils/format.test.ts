import { describe, it, expect } from 'vitest';
import { formatTokens, formatDuration } from '../../../src/utils/format.js';

describe('formatTokens', () => {
  it('returns "-" for undefined', () => {
    expect(formatTokens(undefined)).toBe('-');
  });

  it('formats small numbers as-is', () => {
    expect(formatTokens(42)).toBe('42');
    expect(formatTokens(0)).toBe('0');
    expect(formatTokens(999)).toBe('999');
  });

  it('formats thousands with k suffix, trimming trailing ".0"', () => {
    expect(formatTokens(3_400)).toBe('3.4k');
    expect(formatTokens(1_000)).toBe('1k');
    expect(formatTokens(1_500)).toBe('1.5k');
  });

  it('rounds >= 100k to integer', () => {
    expect(formatTokens(120_000)).toBe('120k');
    expect(formatTokens(123_456)).toBe('123k');
  });

  it('formats millions with M suffix', () => {
    expect(formatTokens(1_500_000)).toBe('1.5M');
    expect(formatTokens(1_000_000)).toBe('1M');
  });
});

describe('formatDuration', () => {
  it('formats >= 1000ms as seconds', () => {
    expect(formatDuration(1500)).toBe('1.5s');
    expect(formatDuration(1000)).toBe('1.0s');
  });

  it('formats < 1000ms as milliseconds', () => {
    expect(formatDuration(42)).toBe('42ms');
    expect(formatDuration(0)).toBe('0ms');
  });
});
