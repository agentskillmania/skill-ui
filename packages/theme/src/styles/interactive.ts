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

/** Options for interactiveRow. */
export interface InteractiveRowOptions {
  /** Whether the row is in active/expanded state. Shows primary border. */
  active?: boolean;
}

/**
 * Interactive row: transparent border -> primary on active, hover background.
 * For expandable list items like EventRow and ToolsCard items.
 */
export function interactiveRow(theme: Theme, options?: InteractiveRowOptions) {
  const { active = false } = options ?? {};
  return css`
    border: 1px solid ${active ? theme.color.primary : 'transparent'};
    border-radius: ${theme.radius.md};
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.12s;
    &:hover {
      background: ${theme.color.fillSecondary};
    }
  `;
}
