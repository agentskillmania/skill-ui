import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Interactive item: cursor pointer + hover background transition.
 * For clickable list items, rows, and cards.
 * @param theme - Theme object
 * @param hoverBg - Optional custom hover background color (defaults to fillSecondary)
 */
export function interactiveItem(theme: Theme, hoverBg?: string) {
  const bg = hoverBg ?? theme.color.fillSecondary;
  return css`
    cursor: pointer;
    transition: background ${theme.motion.duration.fast} ${theme.motion.easing.out};
    &:hover {
      background: ${bg};
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
