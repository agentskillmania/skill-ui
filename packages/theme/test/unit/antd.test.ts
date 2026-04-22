import { describe, it, expect } from 'vitest';
import {
  createAntdConfig,
  lightAntdConfig,
  darkAntdConfig,
  getAntdXTokens,
  lightAntdXTokens,
  darkAntdXTokens,
} from '../../src/antd/index.js';
import { lightTheme, darkTheme } from '../../src/tokens/index.js';

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
