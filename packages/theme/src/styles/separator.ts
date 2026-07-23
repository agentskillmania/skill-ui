import { css } from '@emotion/react';

import type { Theme } from '../types.js';

/** Border direction for separator. */
export type BorderDirection = 'bottom' | 'top' | 'left' | 'right';

/**
 * Border separator.
 * Adds border on specified side (default: bottom) using borderSecondary color.
 */
export function borderSeparator(theme: Theme, direction: BorderDirection = 'bottom') {
  return css`
    border-${direction}: 1px solid ${theme.color.borderSecondary};
  `;
}
