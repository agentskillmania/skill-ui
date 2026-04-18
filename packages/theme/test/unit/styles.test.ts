import { describe, it, expect } from 'vitest';
import { lightTheme, darkTheme } from '../../src/tokens/index.js';
import {
  flexColumn,
  flexRow,
  flexCenter,
  flexWrap,
  gridAutoFill,
} from '../../src/styles/layouts.js';
import { glassEffect, card, borderDefault, borderAccent } from '../../src/styles/effects.js';
import { hoverPrimary, hoverBg, disabled, focusVisible } from '../../src/styles/interactions.js';
import { transition, spin, scaleActive } from '../../src/styles/animations.js';
import { textTruncate, textSecondary } from '../../src/styles/text.js';
import { iconBox, scrollable, absoluteFill } from '../../src/styles/containers.js';
import { media, container } from '../../src/styles/media.js';

/**
 * 验证样式工具函数返回 SerializedStyles（非空、可序列化）
 */
describe('布局样式', () => {
  it('flexColumn 返回有效样式', () => {
    const s = flexColumn(lightTheme, 4);
    expect(s.styles).toContain('flex-direction: column');
    expect(s.styles).toContain(lightTheme.spacing[4]);
  });

  it('flexRow 返回有效样式', () => {
    const s = flexRow(lightTheme, 2);
    expect(s.styles).toContain('display: flex');
    expect(s.styles).toContain('align-items: center');
  });

  it('flexCenter 返回有效样式', () => {
    const s = flexCenter(lightTheme);
    expect(s.styles).toContain('justify-content: center');
  });

  it('flexWrap 返回有效样式', () => {
    const s = flexWrap(lightTheme, 3);
    expect(s.styles).toContain('flex-wrap: wrap');
  });

  it('gridAutoFill 返回有效样式', () => {
    const s = gridAutoFill(lightTheme);
    expect(s.styles).toContain('display: grid');
  });
});

describe('视觉效果', () => {
  it('glassEffect 返回有效样式', () => {
    const s = glassEffect(lightTheme);
    expect(s.styles).toContain('backdrop-filter');
  });

  it('glassEffect dark 模式不崩溃', () => {
    const s = glassEffect(darkTheme);
    expect(s.styles).toContain('backdrop-filter');
    expect(s.styles).not.toContain('undefined');
  });

  it('card 返回有效样式', () => {
    const s = card(lightTheme);
    expect(s.styles).toContain('border-radius');
    expect(s.styles).toContain('box-shadow');
  });

  it('borderDefault 返回有效样式', () => {
    const s = borderDefault(lightTheme);
    expect(s.styles).toContain(lightTheme.color.border);
  });

  it('borderAccent 返回有效样式', () => {
    const s = borderAccent(lightTheme, 'primary');
    expect(s.styles).toContain('border-left');
    expect(s.styles).toContain(lightTheme.color.primary);
  });
});

describe('交互状态', () => {
  it('hoverPrimary 返回有效样式', () => {
    const s = hoverPrimary(lightTheme);
    expect(s.styles).toContain(':hover');
    expect(s.styles).toContain(lightTheme.color.primary);
  });

  it('hoverBg 返回有效样式', () => {
    const s = hoverBg(lightTheme);
    expect(s.styles).toContain(lightTheme.color.hoverOverlay);
  });

  it('disabled 返回有效样式', () => {
    const s = disabled(lightTheme, true);
    expect(s.styles).toContain('not-allowed');
  });

  it('focusVisible 返回有效样式', () => {
    const s = focusVisible(lightTheme);
    expect(s.styles).toContain('focus-visible');
  });
});

describe('动画', () => {
  it('transition 返回有效样式', () => {
    const s = transition(lightTheme);
    expect(s.styles).toContain('transition');
  });

  it('spin 返回有效样式', () => {
    const s = spin(lightTheme);
    expect(s.styles).toContain('@keyframes spin');
    expect(s.styles).toContain('animation');
  });

  it('scaleActive 返回有效样式', () => {
    const s = scaleActive(lightTheme);
    expect(s.styles).toContain('scale');
  });
});

describe('文字', () => {
  it('textTruncate 单行截断', () => {
    const s = textTruncate(lightTheme);
    expect(s.styles).toContain('white-space: nowrap');
    expect(s.styles).toContain('overflow: hidden');
  });

  it('textTruncate 多行截断', () => {
    const s = textTruncate(lightTheme, 3);
    expect(s.styles).toContain('-webkit-line-clamp: 3');
  });

  it('textSecondary 返回有效样式', () => {
    const s = textSecondary(lightTheme);
    expect(s.styles).toContain(lightTheme.color.textSecondary);
  });
});

describe('容器', () => {
  it('iconBox 返回有效样式', () => {
    const s = iconBox(lightTheme);
    expect(s.styles).toContain('display: flex');
  });

  it('scrollable 返回有效样式', () => {
    const s = scrollable(lightTheme);
    expect(s.styles).toContain('overflow-y: auto');
  });

  it('scrollable hidden 滚动条', () => {
    const s = scrollable(lightTheme, '200px', 3, 'hidden');
    expect(s.styles).toContain('scrollbar-width: none');
  });

  it('absoluteFill 返回有效样式', () => {
    const s = absoluteFill(lightTheme);
    expect(s.styles).toContain('position: absolute');
  });

  it('absoluteFill 支持选项对象', () => {
    const s = absoluteFill(lightTheme, { top: 10, zIndex: 100 });
    expect(s.styles).toContain('top: 10px');
    expect(s.styles).toContain('z-index: 100');
  });

  it('absoluteFill 传入 null 不崩溃', () => {
    const s = absoluteFill(lightTheme, null);
    expect(s.styles).toContain('position: absolute');
  });
});

describe('媒体查询', () => {
  it('media 包含 compact 和 standard', () => {
    expect(media.compact).toContain('max-width');
    expect(media.standard).toContain('min-width');
  });

  it('container 包含 compact 和 standard', () => {
    expect(container.compact).toContain('@container');
    expect(container.standard).toContain('@container');
  });
});
