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
 * Verify style utility functions return SerializedStyles (non-null, serializable)
 */
describe('layout styles', () => {
  it('flexColumn returns valid styles', () => {
    const s = flexColumn(lightTheme, 4);
    expect(s.styles).toContain('flex-direction: column');
    expect(s.styles).toContain(lightTheme.spacing[4]);
  });

  it('flexRow returns valid styles', () => {
    const s = flexRow(lightTheme, 2);
    expect(s.styles).toContain('display: flex');
    expect(s.styles).toContain('align-items: center');
  });

  it('flexCenter returns valid styles', () => {
    const s = flexCenter(lightTheme);
    expect(s.styles).toContain('justify-content: center');
  });

  it('flexWrap returns valid styles', () => {
    const s = flexWrap(lightTheme, 3);
    expect(s.styles).toContain('flex-wrap: wrap');
  });

  it('gridAutoFill returns valid styles', () => {
    const s = gridAutoFill(lightTheme);
    expect(s.styles).toContain('display: grid');
  });
});

describe('visual effects', () => {
  it('glassEffect returns valid styles', () => {
    const s = glassEffect(lightTheme);
    expect(s.styles).toContain('backdrop-filter');
  });

  it('glassEffect does not crash in dark mode', () => {
    const s = glassEffect(darkTheme);
    expect(s.styles).toContain('backdrop-filter');
    expect(s.styles).not.toContain('undefined');
  });

  it('card returns valid styles', () => {
    const s = card(lightTheme);
    expect(s.styles).toContain('border-radius');
    expect(s.styles).toContain('box-shadow');
  });

  it('borderDefault returns valid styles', () => {
    const s = borderDefault(lightTheme);
    expect(s.styles).toContain(lightTheme.color.border);
  });

  it('borderAccent returns valid styles', () => {
    const s = borderAccent(lightTheme, 'primary');
    expect(s.styles).toContain('border-left');
    expect(s.styles).toContain(lightTheme.color.primary);
  });
});

describe('interaction states', () => {
  it('hoverPrimary returns valid styles', () => {
    const s = hoverPrimary(lightTheme);
    expect(s.styles).toContain(':hover');
    expect(s.styles).toContain(lightTheme.color.primary);
  });

  it('hoverBg returns valid styles', () => {
    const s = hoverBg(lightTheme);
    expect(s.styles).toContain(lightTheme.color.hoverOverlay);
  });

  it('disabled returns valid styles', () => {
    const s = disabled(lightTheme, true);
    expect(s.styles).toContain('not-allowed');
  });

  it('focusVisible returns valid styles', () => {
    const s = focusVisible(lightTheme);
    expect(s.styles).toContain('focus-visible');
  });
});

describe('animations', () => {
  it('transition returns valid styles', () => {
    const s = transition(lightTheme);
    expect(s.styles).toContain('transition');
  });

  it('spin returns valid styles', () => {
    const s = spin(lightTheme);
    expect(s.styles).toContain('@keyframes spin');
    expect(s.styles).toContain('animation');
  });

  it('scaleActive returns valid styles', () => {
    const s = scaleActive(lightTheme);
    expect(s.styles).toContain('scale');
  });
});

describe('text', () => {
  it('textTruncate single-line truncation', () => {
    const s = textTruncate(lightTheme);
    expect(s.styles).toContain('white-space: nowrap');
    expect(s.styles).toContain('overflow: hidden');
  });

  it('textTruncate multi-line truncation', () => {
    const s = textTruncate(lightTheme, 3);
    expect(s.styles).toContain('-webkit-line-clamp: 3');
  });

  it('textSecondary returns valid styles', () => {
    const s = textSecondary(lightTheme);
    expect(s.styles).toContain(lightTheme.color.textSecondary);
  });
});

describe('containers', () => {
  it('iconBox returns valid styles', () => {
    const s = iconBox(lightTheme);
    expect(s.styles).toContain('display: flex');
  });

  it('scrollable returns valid styles', () => {
    const s = scrollable(lightTheme);
    expect(s.styles).toContain('overflow-y: auto');
  });

  it('scrollable hidden scrollbar', () => {
    const s = scrollable(lightTheme, '200px', 3, 'hidden');
    expect(s.styles).toContain('scrollbar-width: none');
  });

  it('absoluteFill returns valid styles', () => {
    const s = absoluteFill(lightTheme);
    expect(s.styles).toContain('position: absolute');
  });

  it('absoluteFill supports options object', () => {
    const s = absoluteFill(lightTheme, { top: 10, zIndex: 100 });
    expect(s.styles).toContain('top: 10px');
    expect(s.styles).toContain('z-index: 100');
  });

  it('absoluteFill does not crash when passed null', () => {
    const s = absoluteFill(lightTheme, null);
    expect(s.styles).toContain('position: absolute');
  });
});

describe('media queries', () => {
  it('media contains compact and standard', () => {
    expect(media.compact).toContain('max-width');
    expect(media.standard).toContain('min-width');
  });

  it('container contains compact and standard', () => {
    expect(container.compact).toContain('@container');
    expect(container.standard).toContain('@container');
  });
});
