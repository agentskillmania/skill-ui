import { css } from '@emotion/react';

import type { Theme } from '../types.js';

/** Options for scrollContainer. */
export interface ScrollContainerOptions {
  /** Max-height constraint (CSS value). */
  maxHeight?: string;
  /** Overflow behavior (default: 'auto'). */
  overflow?: 'auto' | 'scroll';
  /** Padding value (CSS string, e.g. '12px'). */
  padding?: string;
}

/**
 * Scroll container with optional max-height and padding.
 *
 * 第一个参数 `_theme` 保留是为了与其它样式工具（card/container 等）
 * 的 `(theme, options)` 签名风格一致；当前实现未使用主题值。
 */
export function scrollContainer(_theme: Theme, options: ScrollContainerOptions = {}) {
  const { maxHeight, overflow = 'auto', padding } = options;
  return css`
    overflow-y: ${overflow};
    ${maxHeight ? `max-height: ${maxHeight};` : ''}
    ${padding ? `padding: ${padding};` : ''}
  `;
}
