/**
 * Text style utilities
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Text truncation (single or multiple lines)
 */
export function textTruncate(_theme: Theme, lineClamp = 1) {
  if (lineClamp === 1) {
    return css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    `;
  }

  return css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${lineClamp};
  `;
}

/**
 * Secondary text color
 */
export function textSecondary(theme: Theme, color?: keyof Theme['color'], opacity = 0.7) {
  const colorValue = color ? theme.color[color] : theme.color.textSecondary;
  return css`
    color: ${colorValue};
    opacity: ${opacity};
  `;
}
