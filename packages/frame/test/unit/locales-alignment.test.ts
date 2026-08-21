/**
 * Locale parity guard: zh-CN and en-US must expose the SAME key tree.
 * A key present in one locale but missing in the other used to surface
 * as a raw key (or missing text) for half the users — nothing caught it.
 */
import { describe, it, expect } from 'vitest';
import zhCN from '../../src/locales/zh-CN.json' with { type: 'json' };
import enUS from '../../src/locales/en-US.json' with { type: 'json' };

function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v as Record<string, unknown>, path)
      : [path];
  });
}

describe('frame locale parity', () => {
  it('zh-CN and en-US have identical key trees', () => {
    const zh = keyPaths(zhCN as Record<string, unknown>).sort();
    const en = keyPaths(enUS as Record<string, unknown>).sort();
    const onlyZh = zh.filter((k) => !en.includes(k));
    const onlyEn = en.filter((k) => !zh.includes(k));
    expect(
      { onlyInZhCN: onlyZh, onlyInEnUS: onlyEn },
      'locale key trees drifted — add the missing keys'
    ).toEqual({ onlyInZhCN: [], onlyInEnUS: [] });
  });
});
