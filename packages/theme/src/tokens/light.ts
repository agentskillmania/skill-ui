/**
 * 浅色主题颜色 token
 */
import type { Theme } from '../types.js';
import { spacing, radius, shadow, blur, motion, font, icon } from './shared.js';

export const lightColor: Theme['color'] = {
  // 品牌（主色 #4361ee 蓝紫色）
  primary: '#4361ee',
  primaryHover: '#3651d8',
  primaryActive: '#2a41be',
  primaryBg: 'rgba(67, 97, 238, 0.1)',

  // 语义
  success: '#16a34a',
  successBg: 'rgba(22, 163, 74, 0.1)',
  successBorder: 'rgba(22, 163, 74, 0.3)',
  warning: '#ca8a04',
  warningBg: 'rgba(202, 138, 4, 0.1)',
  warningBorder: 'rgba(202, 138, 4, 0.3)',
  error: '#dc2626',
  errorBg: 'rgba(220, 38, 38, 0.1)',
  errorBorder: 'rgba(220, 38, 38, 0.3)',
  info: '#4361ee',
  infoBg: 'rgba(67, 97, 238, 0.1)',
  infoBorder: 'rgba(67, 97, 238, 0.3)',

  // 扩展颜色
  green: '#16a34a',
  greenBg: 'rgba(22, 163, 74, 0.1)',
  blue: '#4361ee',
  blueBg: 'rgba(67, 97, 238, 0.1)',
  purple: '#8b5cf6',
  purpleBg: 'rgba(139, 92, 246, 0.1)',
  orange: '#f97316',
  orangeBg: 'rgba(249, 115, 22, 0.1)',
  cyan: '#06b6d4',
  cyanBg: 'rgba(6, 182, 212, 0.1)',

  // 背景
  bgBase: '#f8fafc',
  bgContainer: '#ffffff',
  bgElevated: '#fafafa',
  bgSpotlight: '#f1f5f9',
  bgMask: 'rgba(0, 0, 0, 0.4)',

  // 文字
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  textQuaternary: '#cbd5e1',
  textDisabled: '#94a3b8',
  textInverse: '#ffffff',

  // 边框
  border: '#e2e8f0',
  borderSecondary: '#f1f5f9',
  borderHover: '#cbd5e1',
  borderActive: '#94a3b8',

  // 填充
  fill: '#f1f5f9',
  fillSecondary: '#f8fafc',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(0, 0, 0, 0.04)',
  fillLight: 'rgba(0, 0, 0, 0.08)',

  // 链接
  link: '#4361ee',
  linkHover: '#3651d8',
  linkActive: '#2a41be',

  // 玻璃效果
  glassLight: 'rgba(255, 255, 255, 0.5)',
  glassLightStrong: 'rgba(255, 255, 255, 0.7)',

  // 交互状态
  hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  activeOverlay: 'rgba(0, 0, 0, 0.08)',
};

export const lightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)' },
  plan: { text: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)' },
  toolMcp: { text: '#0891b2', bg: 'rgba(8, 145, 178, 0.10)' },
  toolScript: { text: '#d97706', bg: 'rgba(217, 119, 6, 0.10)' },
  toolBuiltin: { text: '#059669', bg: 'rgba(5, 150, 105, 0.10)' },
  humanInput: { text: '#ea580c', bg: 'rgba(234, 88, 12, 0.10)' },
};

export const lightTheme: Theme = {
  mode: 'light',
  color: lightColor,
  blockColor: lightBlockColor,
  spacing,
  radius,
  shadow,
  blur,
  motion,
  font,
  icon,
};
