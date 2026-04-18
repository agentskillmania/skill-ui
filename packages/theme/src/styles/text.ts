/**
 * 文字样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * 文本截断（单行或多行）
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
 * 次要文本颜色
 */
export function textSecondary(theme: Theme, color?: keyof Theme['color'], opacity = 0.7) {
  const colorValue = color ? theme.color[color] : theme.color.textSecondary;
  return css`
    color: ${colorValue};
    opacity: ${opacity};
  `;
}
