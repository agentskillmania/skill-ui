import { css } from '@emotion/react';
import type { Theme } from '@agentskillmania/skill-ui-theme';

/**
 * Empty state text — muted, small, with vertical breathing room.
 * Used by cards/sections that show "no data" fallback text.
 */
export function emptyTextStyle(theme: Theme) {
  return css`
    color: ${theme.color.textTertiary};
    font-size: ${theme.font.size.sm};
    padding: ${theme.spacing[1]} 0;
  `;
}
