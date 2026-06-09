import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Interactive item: cursor pointer + hover background transition.
 * For clickable list items, rows, and cards.
 */
export function interactiveItem(theme: Theme) {
  return css`
    cursor: pointer;
    transition: background ${theme.motion.duration.fast} ${theme.motion.easing.out};
    &:hover {
      background: ${theme.color.fillSecondary};
    }
  `;
}

/**
 * Subtle background with transition.
 * For elements that need a gentle fill with smooth transitions.
 */
export function subtleBackground(theme: Theme) {
  return css`
    background: ${theme.color.fillSecondary};
    transition: background ${theme.motion.duration.fast} ${theme.motion.easing.out};
  `;
}
