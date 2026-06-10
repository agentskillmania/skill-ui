import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/** Options for scrollContainer. */
export interface ScrollContainerOptions {
  /** Max-height constraint (CSS value). */
  maxHeight?: string;
  /** Overflow behavior (default: 'auto'). */
  overflow?: 'auto' | 'scroll';
  /** Padding value (CSS string, e.g. '12px'). */
  padding?: string;
}

/**
 * Scroll container with optional max-height and padding.
 */
export function scrollContainer(theme: Theme, options: ScrollContainerOptions = {}) {
  const { maxHeight, overflow = 'auto', padding } = options;
  return css`
    overflow-y: ${overflow};
    ${maxHeight ? `max-height: ${maxHeight};` : ''}
    ${padding ? `padding: ${padding};` : ''}
  `;
}
