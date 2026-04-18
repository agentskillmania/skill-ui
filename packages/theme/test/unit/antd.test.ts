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
  it('为浅色主题生成正确的配置', () => {
    const config = createAntdConfig(lightTheme);
    expect(config.hashed).toBe(false);
    expect(config.token?.colorPrimary).toBe(lightTheme.color.primary);
    expect(config.token?.colorBgBase).toBe(lightTheme.color.bgContainer);
    expect(config.token?.fontSize).toBe(14);
  });

  it('为深色主题生成正确的配置', () => {
    const config = createAntdConfig(darkTheme);
    expect(config.token?.colorPrimary).toBe(darkTheme.color.primary);
    expect(config.token?.colorBgBase).toBe(darkTheme.color.bgContainer);
  });

  it('预生成的 config 与函数调用一致', () => {
    expect(lightAntdConfig.token?.colorPrimary).toBe(lightTheme.color.primary);
    expect(darkAntdConfig.token?.colorPrimary).toBe(darkTheme.color.primary);
  });
});

describe('getAntdXTokens', () => {
  it('返回 antd-x 所需的 token', () => {
    const tokens = getAntdXTokens(lightTheme);
    expect(tokens.bubbleBg).toBe(lightTheme.color.bgBase);
    expect(tokens.bubbleBorder).toBe(lightTheme.color.border);
    expect(tokens.userBubbleBg).toBe(lightTheme.color.primary);
  });

  it('预生成的 token 与函数调用一致', () => {
    const lightTokens = getAntdXTokens(lightTheme);
    expect(lightAntdXTokens.bubbleBg).toBe(lightTokens.bubbleBg);
    expect(lightAntdXTokens.userBubbleBg).toBe(lightTokens.userBubbleBg);

    const darkTokens = getAntdXTokens(darkTheme);
    expect(darkAntdXTokens.bubbleBg).toBe(darkTokens.bubbleBg);
    expect(darkAntdXTokens.userBubbleBg).toBe(darkTokens.userBubbleBg);
  });
});
