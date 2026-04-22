/**
 * Layout style utilities
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Flex column layout
 */
export function flexColumn(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    flex-direction: column;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * Flex row layout
 */
export function flexRow(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    align-items: center;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * Flex center layout
 */
export function flexCenter(_theme: Theme) {
  return css`
    display: flex;
    align-items: center;
    justify-content: center;
  `;
}

/**
 * Flex wrap layout
 */
export function flexWrap(theme: Theme, gap?: keyof Theme['spacing']) {
  return css`
    display: flex;
    flex-wrap: wrap;
    ${gap !== undefined ? `gap: ${theme.spacing[gap]};` : ''}
  `;
}

/**
 * Responsive grid layout
 */
export function gridAutoFill(theme: Theme, minWidth = '200px', gap: keyof Theme['spacing'] = '3') {
  return css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${minWidth}, 1fr));
    gap: ${theme.spacing[gap]};
  `;
}
