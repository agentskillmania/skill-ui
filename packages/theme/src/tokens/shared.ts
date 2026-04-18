/**
 * 非颜色类 token（亮暗主题共用）
 */
import type { Theme } from '../types.js';

export const breakpoints = {
  /** 小于此值为紧凑模式 */
  compact: '768px',
} as const;

export const spacing: Theme['spacing'] = {
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
};

export const radius: Theme['radius'] = {
  xs: '2px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const shadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 2px 4px rgba(0, 0, 0, 0.05)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
};

export const darkShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  base: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.4)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.5)',
};

export const blur: Theme['blur'] = {
  sm: 'blur(8px)',
  base: 'blur(16px)',
  lg: 'blur(20px)',
  xl: 'blur(40px)',
  glass: 'blur(16px) saturate(180%)',
};

export const motion: Theme['motion'] = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '150ms',
    slow: '200ms',
    slower: '400ms',
  },
  easing: {
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const font: Theme['font'] = {
  family:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif",
  familyMono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', Consolas, monospace",
  familyCode: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', Consolas, monospace",
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  size: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '30px',
  },
  lineHeight: '1.5',
  lineHeightHeading: '1.4',
};

export const icon: Theme['icon'] = {
  xs: '14px',
  sm: '16px',
  md: '20px',
  lg: '24px',
};
