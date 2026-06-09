import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/** Options for scrollContainer. */
export interface ScrollContainerOptions {
  /** Max-height constraint (CSS value). */
  maxHeight?: string;
  /** Overflow behavior (default: 'auto'). */
  overflow?: 'auto' | 'scroll';
}

/**
 * Scroll container with optional max-height.
 * Enhanced version of the existing `scrollable` utility.
 */
export function scrollContainer(theme: Theme, options: ScrollContainerOptions = {}) {
  const { maxHeight, overflow = 'auto' } = options;
  return css`
    overflow-y: ${overflow};
    ${maxHeight ? `max-height: ${maxHeight};` : ''}
  `;
}
