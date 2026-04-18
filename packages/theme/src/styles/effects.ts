/**
 * 视觉效果样式工具
 */
import { css } from '@emotion/react';
import type { Theme } from '../types.js';

/**
 * 毛玻璃效果
 */
export function glassEffect(theme: Theme, strength: 'light' | 'strong' = 'light') {
  // 浅/深色模式统一使用 glassLight / glassLightStrong token
  const bgKey = strength === 'strong' ? 'glassLightStrong' : 'glassLight';
  return css`
    background: ${theme.color[bgKey]};
    backdrop-filter: ${theme.blur.lg};
    -webkit-backdrop-filter: ${theme.blur.lg};
  `;
}

/**
 * 卡片容器（圆角 + 阴影 + 背景）
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
 * 默认边框
 */
export function borderDefault(theme: Theme) {
  return css`
    border: 1px solid ${theme.color.border};
  `;
}

/**
 * 强调边框（左侧彩色边框）
 */
export function borderAccent(theme: Theme, color: keyof Theme['color']) {
  return css`
    border-left: 3px solid ${theme.color[color]};
  `;
}
