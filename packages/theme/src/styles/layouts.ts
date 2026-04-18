/**
 * 布局样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Flex 列布局
 */
export function flexColumn(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    flex-direction: column;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * Flex 行布局
 */
export function flexRow(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    align-items: center;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * Flex 居中布局
 */
export function flexCenter(_theme: Theme) {
  return css`
    display: flex;
    align-items: center;
    justify-content: center;
  `;
}

/**
 * Flex 换行布局
 */
export function flexWrap(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    flex-wrap: wrap;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * 响应式网格布局
 */
export function gridAutoFill(theme: Theme, minWidth = '200px', gap: keyof Theme['spacing'] = '3') {
  return css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${minWidth}, 1fr));
    gap: ${theme.spacing[gap]};
  `;
}
