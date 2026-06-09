import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Bottom border separator.
 * Adds border-bottom: 1px solid borderSecondary.
 */
export function borderSeparator(theme: Theme) {
  return css`
    border-bottom: 1px solid ${theme.color.borderSecondary};
  `;
}
