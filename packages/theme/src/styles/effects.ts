/**
 * Visual effect style utilities
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * Glassmorphism effect
 */
export function glassEffect(theme: Theme, strength: 'light' | 'strong' = 'light') {
  // Light/dark modes uniformly use glassLight / glassLightStrong tokens
  const bgKey = strength === 'strong' ? 'glassLightStrong' : 'glassLight';
  return css`
    background: ${theme.color[bgKey]};
    backdrop-filter: ${theme.blur.lg};
    -webkit-backdrop-filter: ${theme.blur.lg};
  `;
}

/**
 * Card container (border radius + shadow + background)
 */
export function card(
  theme: Theme,
  options?: {
    radius?: keyof Theme['radius'];
    shadow?: keyof Theme['shadow'];
    background?: keyof Theme['color'];
  }
) {
  const r = options?.radius ?? 'lg';
  const s = options?.shadow ?? 'md';
  const bg = options?.background ?? 'bgContainer';
  return css`
    border-radius: ${theme.radius[r]};
    box-shadow: ${theme.shadow[s]};
    background: ${theme.color[bg]};
  `;
}

/**
 * Default border
 */
export function borderDefault(theme: Theme) {
  return css`
    border: 1px solid ${theme.color.border};
  `;
}

/**
 * Accent border (colored left border)
 */
export function borderAccent(theme: Theme, color: keyof Theme['color']) {
  return css`
    border-left: 3px solid ${theme.color[color]};
  `;
}
