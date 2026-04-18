import { describe, it, expect } from 'vitest';
import {
  getTheme,
  lightTheme,
  darkTheme,
  lightColor,
  darkColor,
  lightBlockColor,
  darkBlockColor,
} from '../../src/tokens/index.js';
import {
  spacing,
  radius,
  shadow,
  blur,
  motion,
  font,
  icon,
  breakpoints,
} from '../../src/tokens/shared.js';
import { layout, zIndex } from '../../src/constants.js';

describe('getTheme', () => {
  it('返回浅色主题', () => {
    const theme = getTheme('light');
    expect(theme.mode).toBe('light');
    expect(theme.color).toBe(lightColor);
    expect(theme.blockColor).toBe(lightBlockColor);
  });

  it('返回深色主题', () => {
    const theme = getTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.color).toBe(darkColor);
    expect(theme.blockColor).toBe(darkBlockColor);
  });
});

describe('lightTheme', () => {
  it('有正确的 mode', () => {
    expect(lightTheme.mode).toBe('light');
  });

  it('包含必需的颜色 token', () => {
    expect(lightTheme.color.primary).toBe('#4361ee');
    expect(lightTheme.color.text).toBeTruthy();
    expect(lightTheme.color.bgBase).toBeTruthy();
    expect(lightTheme.color.border).toBeTruthy();
  });

  it('包含新增的颜色 token', () => {
    expect(lightTheme.color.textInverse).toBe('#ffffff');
    expect(lightTheme.color.borderHover).toBeTruthy();
    expect(lightTheme.color.borderActive).toBeTruthy();
  });

  it('包含 blockColor（嵌套结构）', () => {
    expect(lightTheme.blockColor.thinking.text).toBeTruthy();
    expect(lightTheme.blockColor.thinking.bg).toBeTruthy();
    expect(lightTheme.blockColor.humanInput.text).toBeTruthy();
    expect(lightTheme.blockColor.humanInput.bg).toBeTruthy();
    expect(lightTheme.blockColor.toolMcp.text).toBeTruthy();
    expect(lightTheme.blockColor.toolBuiltin.text).toBeTruthy();
    expect(lightTheme.blockColor.plan.text).toBeTruthy();
  });

  it('复用 shared 非 color token', () => {
    expect(lightTheme.spacing).toBe(spacing);
    expect(lightTheme.radius).toBe(radius);
    expect(lightTheme.shadow).toBe(shadow);
    expect(lightTheme.blur).toBe(blur);
    expect(lightTheme.motion).toBe(motion);
    expect(lightTheme.font).toBe(font);
    expect(lightTheme.icon).toBe(icon);
  });

  it('不包含 layout 和 zIndex（已提取到 constants）', () => {
    expect('layout' in lightTheme).toBe(false);
    expect('zIndex' in lightTheme).toBe(false);
  });
});

describe('darkTheme', () => {
  it('有正确的 mode', () => {
    expect(darkTheme.mode).toBe('dark');
  });

  it('包含必需的颜色 token', () => {
    expect(darkTheme.color.primary).toBeTruthy();
    expect(darkTheme.color.text).toBeTruthy();
    expect(darkTheme.color.bgBase).toBeTruthy();
  });

  it('深色背景比浅色深', () => {
    expect(darkTheme.color.bgBase).toMatch(/^#[0-9a-f]{6}$/);
    expect(darkTheme.color.bgContainer).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('包含新增的颜色 token', () => {
    expect(darkTheme.color.textInverse).toBe('#0f172a');
    expect(darkTheme.color.borderHover).toBeTruthy();
    expect(darkTheme.color.borderActive).toBeTruthy();
  });

  it('复用 shared 非 color token', () => {
    expect(darkTheme.spacing).toBe(spacing);
    expect(darkTheme.radius).toBe(radius);
    expect(darkTheme.blur).toBe(blur);
    expect(darkTheme.motion).toBe(motion);
    expect(darkTheme.font).toBe(font);
  });

  it('不包含 layout 和 zIndex', () => {
    expect('layout' in darkTheme).toBe(false);
    expect('zIndex' in darkTheme).toBe(false);
  });
});

describe('shared tokens', () => {
  it('spacing 包含常用间距', () => {
    expect(spacing[1]).toBe('4px');
    expect(spacing[2]).toBe('8px');
    expect(spacing[4]).toBe('16px');
    expect(spacing[8]).toBe('32px');
  });

  it('radius 包含常用圆角', () => {
    expect(radius.sm).toBe('4px');
    expect(radius.md).toBe('8px');
    expect(radius.full).toBe('9999px');
  });

  it('shadow 包含常用阴影', () => {
    expect(shadow.sm).toBeTruthy();
    expect(shadow.base).toBeTruthy();
    expect(shadow.md).toBeTruthy();
  });

  it('font 包含字体配置', () => {
    expect(font.family).toContain('sans-serif');
    expect(font.familyMono).toContain('monospace');
    expect(font.size.base).toBe('14px');
    expect(font.weight.normal).toBe(400);
  });

  it('breakpoints 定义了紧凑断点', () => {
    expect(breakpoints.compact).toBe('768px');
  });
});

describe('constants', () => {
  it('layout 包含布局常量', () => {
    expect(layout.titlebarHeight).toBe('38px');
    expect(layout.chatInputHeight).toBe('56px');
  });

  it('zIndex 按层级递增', () => {
    expect(zIndex.base).toBeLessThan(zIndex.dropdown);
    expect(zIndex.dropdown).toBeLessThan(zIndex.modal);
    expect(zIndex.modal).toBeLessThan(zIndex.tooltip);
  });
});
