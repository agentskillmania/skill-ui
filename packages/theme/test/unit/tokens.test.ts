import { describe, it, expect } from 'vitest';
import { getTheme, lightTheme, darkTheme, lightColor, darkColor } from '../../src/tokens/index.js';
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
  it('returns light theme', () => {
    const theme = getTheme('light');
    expect(theme.mode).toBe('light');
    expect(theme.color).toBe(lightColor);
  });

  it('returns dark theme', () => {
    const theme = getTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.color).toBe(darkColor);
  });
});

describe('lightTheme', () => {
  it('has correct mode', () => {
    expect(lightTheme.mode).toBe('light');
  });

  it('contains required color tokens', () => {
    expect(lightTheme.color.primary).toBe('#4361ee');
    expect(lightTheme.color.text).toBe('#0f172a');
    expect(lightTheme.color.bgBase).toBe('#f1f5f9');
    expect(lightTheme.color.border).toBe('#e2e8f0');
  });

  it('contains new color tokens', () => {
    expect(lightTheme.color.textInverse).toBe('#ffffff');
    expect(lightTheme.color.borderHover).toBe('#cbd5e1');
    expect(lightTheme.color.borderActive).toBe('#94a3b8');
  });

  it('no longer carries blockColor (blocks use semantic color tokens)', () => {
    expect('blockColor' in lightTheme).toBe(false);
    expect('blockColor' in darkTheme).toBe(false);
  });

  it('reuses shared non-color tokens', () => {
    expect(lightTheme.spacing).toBe(spacing);
    expect(lightTheme.radius).toBe(radius);
    expect(lightTheme.shadow).toBe(shadow);
    expect(lightTheme.blur).toBe(blur);
    expect(lightTheme.motion).toBe(motion);
    expect(lightTheme.font).toBe(font);
    expect(lightTheme.icon).toBe(icon);
  });

  it('does not contain layout and zIndex (extracted to constants)', () => {
    expect('layout' in lightTheme).toBe(false);
    expect('zIndex' in lightTheme).toBe(false);
  });
});

describe('darkTheme', () => {
  it('has correct mode', () => {
    expect(darkTheme.mode).toBe('dark');
  });

  it('contains required color tokens', () => {
    expect(darkTheme.color.primary).toBe('#6b83f2');
    expect(darkTheme.color.text).toBe('#f1f5f9');
    expect(darkTheme.color.bgBase).toBe('#0f172a');
  });

  it('dark background is darker than light', () => {
    // 真比较明暗(WCAG 相对亮度),而非只验 hex 格式
    const luminance = (hex: string) => {
      const n = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
    };
    expect(darkTheme.color.bgBase).toMatch(/^#[0-9a-f]{6}$/);
    expect(lightTheme.color.bgBase).toMatch(/^#[0-9a-f]{6}$/);
    expect(luminance(darkTheme.color.bgBase)).toBeLessThan(luminance(lightTheme.color.bgBase));
  });

  it('contains new color tokens', () => {
    expect(darkTheme.color.textInverse).toBe('#0f172a');
    expect(darkTheme.color.borderHover).toBe('#475569');
    expect(darkTheme.color.borderActive).toBe('#64748b');
  });

  it('reuses shared non-color tokens', () => {
    expect(darkTheme.spacing).toBe(spacing);
    expect(darkTheme.radius).toBe(radius);
    expect(darkTheme.blur).toBe(blur);
    expect(darkTheme.motion).toBe(motion);
    expect(darkTheme.font).toBe(font);
  });

  it('does not contain layout and zIndex', () => {
    expect('layout' in darkTheme).toBe(false);
    expect('zIndex' in darkTheme).toBe(false);
  });
});

describe('shared tokens', () => {
  it('spacing contains common spacing values', () => {
    expect(spacing[1]).toBe('4px');
    expect(spacing[2]).toBe('8px');
    expect(spacing[4]).toBe('16px');
    expect(spacing[8]).toBe('32px');
  });

  it('radius contains common border radius values', () => {
    expect(radius.sm).toBe('4px');
    expect(radius.md).toBe('8px');
    expect(radius.full).toBe('9999px');
  });

  it('shadow contains common shadows', () => {
    expect(shadow.sm).toBe('0 1px 2px rgba(15, 23, 42, 0.06)');
    expect(shadow.base).toBe('0 1px 3px rgba(15, 23, 42, 0.08)');
    expect(shadow.md).toBe('0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.08)');
  });

  it('font contains font configuration', () => {
    expect(font.family).toContain('sans-serif');
    expect(font.familyMono).toContain('monospace');
    expect(font.size.base).toBe('14px');
    expect(font.weight.normal).toBe(400);
  });

  it('breakpoints defines compact breakpoint', () => {
    expect(breakpoints.compact).toBe('768px');
  });
});

describe('Semantic color tokens', () => {
  it('lightTheme has eventStatusColor with all event types', () => {
    const keys = Object.keys(lightTheme.eventStatusColor);
    expect(keys).toContain('lifecycle');
    expect(keys).toContain('phase');
    expect(keys).toContain('token');
    expect(keys).toContain('tool');
    expect(keys).toContain('error');
    expect(keys).toContain('compressing');
    expect(keys).toContain('skill');
    expect(keys).toContain('subagent');
    expect(keys).toContain('llm');
    expect(keys).toContain('thinking');
    // Each entry has text and bg
    for (const key of keys) {
      expect(lightTheme.eventStatusColor[key]).toHaveProperty('text');
      expect(lightTheme.eventStatusColor[key]).toHaveProperty('bg');
    }
  });

  it('lightTheme has agentStatusColor with all agent statuses', () => {
    const keys = Object.keys(lightTheme.agentStatusColor);
    expect(keys).toContain('idle');
    expect(keys).toContain('running');
    expect(keys).toContain('paused');
    expect(keys).toContain('error');
    expect(keys).toContain('completed');
    for (const key of keys) {
      expect(lightTheme.agentStatusColor[key]).toHaveProperty('text');
      expect(lightTheme.agentStatusColor[key]).toHaveProperty('bg');
    }
  });

  it('lightTheme has skillStatusColor with all skill statuses', () => {
    const keys = Object.keys(lightTheme.skillStatusColor);
    expect(keys).toContain('loading');
    expect(keys).toContain('loaded');
    expect(keys).toContain('active');
    expect(keys).toContain('completed');
    expect(keys).toContain('error');
    for (const key of keys) {
      expect(lightTheme.skillStatusColor[key]).toHaveProperty('text');
      expect(lightTheme.skillStatusColor[key]).toHaveProperty('bg');
    }
  });

  it('darkTheme has all the same semantic color keys as lightTheme', () => {
    expect(Object.keys(darkTheme.eventStatusColor)).toEqual(
      Object.keys(lightTheme.eventStatusColor)
    );
    expect(Object.keys(darkTheme.agentStatusColor)).toEqual(
      Object.keys(lightTheme.agentStatusColor)
    );
    expect(Object.keys(darkTheme.skillStatusColor)).toEqual(
      Object.keys(lightTheme.skillStatusColor)
    );
  });

  it('dark tokens are not identical to light tokens', () => {
    expect(darkTheme.eventStatusColor.tool.text).not.toBe(lightTheme.eventStatusColor.tool.text);
    expect(darkTheme.agentStatusColor.running.text).not.toBe(
      lightTheme.agentStatusColor.running.text
    );
  });
});

describe('constants', () => {
  it('layout contains layout constants', () => {
    expect(layout.titlebarHeight).toBe('38px');
    expect(layout.chatInputHeight).toBe('56px');
  });

  it('zIndex increases by level', () => {
    expect(zIndex.base).toBeLessThan(zIndex.dropdown);
    expect(zIndex.dropdown).toBeLessThan(zIndex.modal);
    expect(zIndex.modal).toBeLessThan(zIndex.tooltip);
  });
});
