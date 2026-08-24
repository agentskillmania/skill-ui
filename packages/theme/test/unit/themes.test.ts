import { describe, it, expect } from 'vitest';
import {
  getTheme,
  themeRegistry,
  themeMetas,
  resolveThemeId,
  defaultThemeId,
  lightTheme,
  darkTheme,
} from '../../src/tokens/index.js';
import { getAntdConfig } from '../../src/antd/index.js';

const COLOR_KEYS = Object.keys(lightTheme.color);
const BLOCK_KEYS = Object.keys(lightTheme.blockColor);
const EVENT_KEYS = Object.keys(lightTheme.eventStatusColor);
const AGENT_KEYS = Object.keys(lightTheme.agentStatusColor);
const SKILL_KEYS = Object.keys(lightTheme.skillStatusColor);

describe('themeRegistry', () => {
  it('contains all six themes in display order', () => {
    expect(Object.keys(themeRegistry)).toEqual([
      'slate',
      'paper',
      'ink',
      'neon',
      'ember',
      'blossom',
    ]);
  });

  it('every theme has light and dark variants with correct modes', () => {
    for (const entry of Object.values(themeRegistry)) {
      expect(entry.light.mode).toBe('light');
      expect(entry.dark.mode).toBe('dark');
    }
  });

  it('every variant has the full token surface (color/blockColor/status colors)', () => {
    for (const entry of Object.values(themeRegistry)) {
      for (const variant of [entry.light, entry.dark]) {
        expect(Object.keys(variant.color).sort()).toEqual([...COLOR_KEYS].sort());
        expect(Object.keys(variant.blockColor).sort()).toEqual([...BLOCK_KEYS].sort());
        expect(Object.keys(variant.eventStatusColor).sort()).toEqual([...EVENT_KEYS].sort());
        expect(Object.keys(variant.agentStatusColor).sort()).toEqual([...AGENT_KEYS].sort());
        expect(Object.keys(variant.skillStatusColor).sort()).toEqual([...SKILL_KEYS].sort());
        for (const value of Object.values(variant.color)) {
          // 每个颜色 token 必须是合法的 hex 或 rgba() 字符串——
          // toBeTruthy 会被任意垃圾值骗过
          expect(String(value)).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\(.+\))$/);
        }
      }
    }
  });

  it('slate stays identical to the historical light/dark themes', () => {
    expect(themeRegistry.slate.light).toBe(lightTheme);
    expect(themeRegistry.slate.dark).toBe(darkTheme);
  });

  it('themes are visually distinct (different base backgrounds and primaries)', () => {
    const bases = Object.values(themeRegistry).map((e) => e.light.color.bgBase);
    const primaries = Object.values(themeRegistry).map((e) => e.light.color.primary);
    expect(new Set(bases).size).toBe(6);
    expect(new Set(primaries).size).toBe(6);
  });
});

describe('themeMetas', () => {
  it('lists all themes with picker-ready metadata', () => {
    expect(themeMetas.map((m) => m.id)).toEqual([
      'slate',
      'paper',
      'ink',
      'neon',
      'ember',
      'blossom',
    ]);
    for (const meta of themeMetas) {
      expect(meta.name).toMatch(/^\S.+\S$/);
      expect(meta.nameZh).toMatch(/^\S(.*\S)?$/);
      expect(meta.swatch.primary).toMatch(/^#/);
      expect(meta.swatch.bgBase).toMatch(/^#/);
    }
  });
});

describe('getTheme with themeId', () => {
  it('defaults to slate when themeId is omitted', () => {
    expect(getTheme('light')).toBe(lightTheme);
    expect(getTheme('dark')).toBe(darkTheme);
  });

  it('returns the requested theme variant', () => {
    expect(getTheme('light', 'paper')).toBe(themeRegistry.paper.light);
    expect(getTheme('dark', 'paper')).toBe(themeRegistry.paper.dark);
    expect(getTheme('light', 'ink')).toBe(themeRegistry.ink.light);
    expect(getTheme('dark', 'ink')).toBe(themeRegistry.ink.dark);
  });
});

describe('resolveThemeId', () => {
  it('passes through known ids', () => {
    expect(resolveThemeId('paper')).toBe('paper');
    expect(resolveThemeId('ink')).toBe('ink');
  });

  it('falls back to the default for unknown or empty values', () => {
    expect(resolveThemeId('nope')).toBe(defaultThemeId);
    expect(resolveThemeId('')).toBe(defaultThemeId);
    expect(resolveThemeId(null)).toBe(defaultThemeId);
    expect(resolveThemeId(undefined)).toBe(defaultThemeId);
  });
});

describe('getAntdConfig', () => {
  it('maps the requested theme into antd tokens', () => {
    expect(getAntdConfig('light', 'paper').token?.colorPrimary).toBe(
      themeRegistry.paper.light.color.primary
    );
    expect(getAntdConfig('dark', 'ink').token?.colorBgLayout).toBe(
      themeRegistry.ink.dark.color.bgBase
    );
  });

  it('matches the pre-generated slate configs when themeId is omitted', () => {
    expect(getAntdConfig('light').token?.colorPrimary).toBe(lightTheme.color.primary);
    expect(getAntdConfig('dark').token?.colorPrimary).toBe(darkTheme.color.primary);
  });
});
