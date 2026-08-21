import { describe, it, expect } from 'vitest';
import {
  createAntdConfig,
  lightAntdConfig,
  darkAntdConfig,
  getAntdXTokens,
  lightAntdXTokens,
  darkAntdXTokens,
} from '../../src/antd/index.js';
import { lightTheme, darkTheme, getTheme } from '../../src/tokens/index.js';

describe('createAntdConfig', () => {
  it('generates correct config for light theme', () => {
    const config = createAntdConfig(lightTheme);
    expect(config.hashed).toBe(false);
    expect(config.token?.colorPrimary).toBe(lightTheme.color.primary);
    expect(config.token?.colorBgBase).toBe(lightTheme.color.bgContainer);
    expect(config.token?.fontSize).toBe(14);
  });

  it('generates correct config for dark theme', () => {
    const config = createAntdConfig(darkTheme);
    expect(config.token?.colorPrimary).toBe(darkTheme.color.primary);
    expect(config.token?.colorBgBase).toBe(darkTheme.color.bgContainer);
  });

  it('pre-generated config matches function call', () => {
    expect(lightAntdConfig.token?.colorPrimary).toBe(lightTheme.color.primary);
    expect(darkAntdConfig.token?.colorPrimary).toBe(darkTheme.color.primary);
  });

  /// 淡染系补正:低亮度主色(ink/paper)的 colorPrimaryBg 必须是"主色与
  /// 容器底的直接混合"(muddy 派生的反例见 primaryDerivationFix 注释),
  /// 且对正常主色(slate)同样给出统一量级;Menu 选中底同源。
  it('pins colorPrimaryBg to a direct primary/bg mix for every theme', () => {
    const mix = (fg: string, bg: string, k: number) => {
      const h = (x: string) => {
        const n = parseInt(x.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      };
      const F = h(fg);
      const B = h(bg);
      const m = (a: number, b: number) => Math.round(a * k + b * (1 - k));
      return `rgb(${m(F[0], B[0])}, ${m(F[1], B[1])}, ${m(F[2], B[2])})`;
    };
    for (const [mode, themeId] of [
      ['light', 'slate'],
      ['light', 'paper'],
      ['light', 'ink'],
      ['dark', 'paper'],
      ['dark', 'ink'],
    ] as const) {
      const t = getTheme(mode, themeId);
      const config = createAntdConfig(t);
      expect(config.token?.colorPrimaryBg, `${themeId} ${mode}`).toBe(
        mix(t.color.primary, t.color.bgContainer, mode === 'dark' ? 0.12 : 0.08)
      );
      expect(config.token?.colorPrimaryBgHover, `${themeId} ${mode}`).toBe(
        mix(t.color.primary, t.color.bgContainer, mode === 'dark' ? 0.18 : 0.13)
      );
      const menu = (config.components as Record<string, Record<string, string>>).Menu;
      expect(menu.itemSelectedBg).toBe(
        mix(t.color.primary, t.color.bgContainer, mode === 'dark' ? 0.18 : 0.12)
      );
      expect(menu.itemSelectedColor).toBe(t.color.primary);
    }
  });
});

describe('getAntdXTokens', () => {
  it('returns tokens required by antd-x', () => {
    const tokens = getAntdXTokens(lightTheme);
    expect(tokens.bubbleBg).toBe(lightTheme.color.bgBase);
    expect(tokens.bubbleBorder).toBe(lightTheme.color.border);
    expect(tokens.userBubbleBg).toBe(lightTheme.color.primary);
  });

  it('pre-generated tokens match function call', () => {
    const lightTokens = getAntdXTokens(lightTheme);
    expect(lightAntdXTokens.bubbleBg).toBe(lightTokens.bubbleBg);
    expect(lightAntdXTokens.userBubbleBg).toBe(lightTokens.userBubbleBg);

    const darkTokens = getAntdXTokens(darkTheme);
    expect(darkAntdXTokens.bubbleBg).toBe(darkTokens.bubbleBg);
    expect(darkAntdXTokens.userBubbleBg).toBe(darkTokens.userBubbleBg);
  });
});
