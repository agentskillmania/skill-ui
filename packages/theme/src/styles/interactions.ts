/**
 * 交互状态样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * 主色 hover 效果（边框变主色 + 背景变主色背景）
 */
export function hoverPrimary(theme: Theme) {
  return css`
    &:hover:not(:disabled) {
      border-color: ${theme.color.primary};
      background: ${theme.color.primaryBg};
    }
  `;
}

/**
 * 背景 hover 效果
 */
export function hoverBg(theme: Theme) {
  return css`
    &:hover:not(:disabled) {
      background: ${theme.color.hoverOverlay};
    }
  `;
}

/**
 * 禁用状态
 */
export function disabled(_theme: Theme, isDisabled = true) {
  return css`
    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
    opacity: ${isDisabled ? 0.5 : 1};
  `;
}

/**
 * 焦点可见状态
 */
export function focusVisible(theme: Theme) {
  return css`
    &:focus-visible {
      outline: 2px solid ${theme.color.primary};
      outline-offset: 2px;
    }
  `;
}
