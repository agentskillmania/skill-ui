import type { Theme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

/**
 * Expandable detail area transition.
 * Uses max-height for expand/collapse animation.
 */
export function expandableDetailTransition(
  theme: Theme,
  expanded: boolean,
  duration: number = 150
) {
  const ms = `${duration}ms`;
  if (expanded) {
    return css`
      max-height: 500px;
      overflow-y: auto;
      transition: max-height ${ms} ${theme.motion.easing.out};
    `;
  }
  return css`
    max-height: 0;
    overflow: hidden;
    transition: max-height ${ms} ${theme.motion.easing.out};
  `;
}

/**
 * Summary row hover style.
 * Adds subtle background on hover.
 */
export function expandableSummaryHover(theme: Theme) {
  return css`
    cursor: pointer;
    transition: background ${theme.motion.duration.fast};
    &:hover {
      background: ${theme.color.fillSecondary};
    }
  `;
}
