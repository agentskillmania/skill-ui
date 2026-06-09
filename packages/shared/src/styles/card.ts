import { css } from '@emotion/react';
import type { Theme } from '@agentskillmania/skill-ui-theme';

/**
 * Card body area transition style.
 * Applies max-height and padding transitions for collapse animation.
 */
export function cardBodyTransition(theme: Theme, collapsed: boolean) {
  if (collapsed) {
    return css`
      max-height: 0;
      padding: 0 ${theme.spacing[3]};
      overflow: hidden;
      transition: max-height ${theme.motion.duration.normal} ${theme.motion.easing.out},
        padding ${theme.motion.duration.normal} ${theme.motion.easing.out};
    `;
  }
  return css`
    max-height: 500px;
    overflow-y: auto;
    transition: max-height ${theme.motion.duration.normal} ${theme.motion.easing.out},
      padding ${theme.motion.duration.normal} ${theme.motion.easing.out};
  `;
}

/**
 * Card header interactive style.
 * Adds cursor pointer and hover background for clickable headers.
 */
export function cardHeaderInteractive(theme: Theme) {
  return css`
    cursor: pointer;
    user-select: none;
    transition: background ${theme.motion.duration.fast};
    &:hover {
      background: ${theme.color.fillSecondary};
    }
  `;
}
