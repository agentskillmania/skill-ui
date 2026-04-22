/**
 * Interaction state style utilities
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Primary hover effect (border turns primary + background turns primary background)
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
 * Background hover effect
 */
export function hoverBg(theme: Theme) {
  return css`
    &:hover:not(:disabled) {
      background: ${theme.color.hoverOverlay};
    }
  `;
}

/**
 * Disabled state
 */
export function disabled(_theme: Theme, isDisabled = true) {
  return css`
    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
    opacity: ${isDisabled ? 0.5 : 1};
  `;
}

/**
 * Focus visible state
 */
export function focusVisible(theme: Theme) {
  return css`
    &:focus-visible {
      outline: 2px solid ${theme.color.primary};
      outline-offset: 2px;
    }
  `;
}
