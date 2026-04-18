/**
 * 容器样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * 图标容器
 */
export function iconBox(
  theme: Theme,
  size = '40px',
  background: keyof Theme['color'] = 'fillSubtle',
  radius: keyof Theme['radius'] = 'md'
) {
  return css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${size};
    height: ${size};
    border-radius: ${theme.radius[radius]};
    background: ${theme.color[background]};
  `;
}

/**
 * 可滚动容器
 */
export function scrollable(
  theme: Theme,
  height = '200px',
  padding: keyof Theme['spacing'] | number = '3',
  scrollbarVisibility: 'auto' | 'hidden' = 'auto'
) {
  const paddingValue = typeof padding === 'number' ? `${padding}px` : theme.spacing[padding];

  const scrollbarStyles =
    scrollbarVisibility === 'hidden'
      ? css`
          scrollbar-width: none;
          -ms-overflow-style: none;
          &::-webkit-scrollbar {
            display: none;
          }
        `
      : css`
          scrollbar-width: thin;
          scrollbar-color: ${theme.color.textSecondary} ${theme.color.fillSecondary};
        `;

  return css`
    overflow-y: auto;
    ${height !== 'none' ? `height: ${height};` : ''}
    padding: ${paddingValue};
    transition: background-color ${theme.motion.duration.normal};
    ${scrollbarStyles}
  `;
}

interface AbsoluteFillOptions {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number | string;
  overflow?: 'auto' | 'hidden' | 'visible' | 'scroll';
}

/**
 * 绝对定位填充容器
 */
export function absoluteFill(
  _theme: Theme,
  optionsOrTop?: AbsoluteFillOptions | string | number,
  right?: string | number,
  bottom?: string | number,
  left?: string | number,
  zIndex?: string | number
) {
  let options: AbsoluteFillOptions;

  if (typeof optionsOrTop === 'object' && optionsOrTop !== null) {
    options = optionsOrTop;
  } else {
    options = { top: optionsOrTop, right, bottom, left, zIndex, overflow: 'visible' };
  }

  const {
    top = 0,
    right: r = 0,
    bottom: b = 0,
    left: l = 0,
    zIndex: z = 'auto',
    overflow = 'visible',
  } = options;

  return css`
    position: absolute;
    top: ${typeof top === 'number' ? `${top}px` : top};
    right: ${typeof r === 'number' ? `${r}px` : r};
    bottom: ${typeof b === 'number' ? `${b}px` : b};
    left: ${typeof l === 'number' ? `${l}px` : l};
    z-index: ${z};
    overflow: ${overflow};
  `;
}
