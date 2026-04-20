/**
 * 深色主题颜色 token
 */
import type { Theme } from '../types.js';
import { spacing, radius, darkShadow, blur, motion, font, icon } from './shared.js';

export const darkColor: Theme['color'] = {
  // 品牌（主色 #6b83f2 蓝紫色，深色模式下提亮）
  primary: '#6b83f2',
  primaryHover: '#7d93f5',
  primaryActive: '#5a72e0',
  primaryBg: 'rgba(107, 131, 242, 0.15)',

  // 语义
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.12)',
  successBorder: 'rgba(74, 222, 128, 0.25)',
  warning: '#facc15',
  warningBg: 'rgba(250, 204, 21, 0.12)',
  warningBorder: 'rgba(250, 204, 21, 0.25)',
  error: '#f87171',
  errorBg: 'rgba(248, 113, 113, 0.12)',
  errorBorder: 'rgba(248, 113, 113, 0.25)',
  info: '#6b83f2',
  infoBg: 'rgba(107, 131, 242, 0.15)',
  infoBorder: 'rgba(107, 131, 242, 0.25)',

  // 扩展颜色
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.12)',
  blue: '#6b83f2',
  blueBg: 'rgba(107, 131, 242, 0.12)',
  purple: '#a78bfa',
  purpleBg: 'rgba(167, 139, 250, 0.12)',
  orange: '#fb923c',
  orangeBg: 'rgba(251, 146, 60, 0.12)',
  cyan: '#22d3ee',
  cyanBg: 'rgba(34, 211, 238, 0.12)',

  // 背景
  bgBase: '#0f172a',
  bgLayout: '#0f172a',
  bgContainer: '#1e293b',
  bgElevated: '#334155',
  bgSpotlight: '#1e293b',
  bgMask: 'rgba(0, 0, 0, 0.6)',

  // 文字
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textQuaternary: '#475569',
  textDisabled: '#475569',
  textInverse: '#0f172a',

  // 边框
  border: '#334155',
  borderSecondary: '#1e293b',
  borderHover: '#475569',
  borderActive: '#64748b',

  // 填充
  fill: '#1e293b',
  fillSecondary: '#0f172a',
  fillTertiary: '#334155',
  fillSubtle: 'rgba(255, 255, 255, 0.04)',
  fillLight: 'rgba(255, 255, 255, 0.08)',

  // 链接
  link: '#6b83f2',
  linkHover: '#7d93f5',
  linkActive: '#5a72e0',

  // 玻璃效果
  glassLight: 'rgba(30, 41, 59, 0.6)',
  glassLightStrong: 'rgba(30, 41, 59, 0.8)',

  // 交互状态
  hoverOverlay: 'rgba(255, 255, 255, 0.04)',
  activeOverlay: 'rgba(255, 255, 255, 0.08)',
};

export const darkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  plan: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  toolMcp: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  toolScript: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  toolBuiltin: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  humanInput: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  skill: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
};

export const darkTheme: Theme = {
  mode: 'dark',
  color: darkColor,
  blockColor: darkBlockColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
