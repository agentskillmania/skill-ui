/**
 * Paper theme (暖纸) — warm paper neutrals + muted teal primary.
 *
 * Designed for long reading/writing sessions: the cool slate grays are replaced
 * by warm stone tones, chroma is lowered across the board, and tinted shadows
 * keep layering legible without hairline-border noise.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Warm-tinted light shadows (stone-900 rgb 28,25,23) */
const paperShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(28, 25, 23, 0.06)',
  base: '0 1px 3px rgba(28, 25, 23, 0.08)',
  md: '0 2px 4px rgba(28, 25, 23, 0.06), 0 4px 12px rgba(28, 25, 23, 0.08)',
  lg: '0 4px 8px rgba(28, 25, 23, 0.08), 0 8px 24px rgba(28, 25, 23, 0.1)',
  xl: '0 8px 16px rgba(28, 25, 23, 0.08), 0 16px 40px rgba(28, 25, 23, 0.12)',
};

export const paperLightColor: Theme['color'] = {
  // Brand — muted teal-green (墨绿)
  primary: '#0f766e',
  primaryHover: '#115e59',
  primaryActive: '#134e4a',
  primaryBg: 'rgba(15, 118, 110, 0.08)',

  // Semantic
  success: '#047857',
  successBg: 'rgba(4, 120, 87, 0.08)',
  successBorder: 'rgba(4, 120, 87, 0.25)',
  warning: '#b45309',
  warningBg: 'rgba(180, 83, 9, 0.08)',
  warningBorder: 'rgba(180, 83, 9, 0.25)',
  error: '#b91c1c',
  errorBg: 'rgba(185, 28, 28, 0.08)',
  errorBorder: 'rgba(185, 28, 28, 0.25)',
  info: '#0f766e',
  infoBg: 'rgba(15, 118, 110, 0.08)',
  infoBorder: 'rgba(15, 118, 110, 0.25)',

  // Extended colors — muted 700-level jewel tones on warm paper
  green: '#047857',
  greenBg: 'rgba(4, 120, 87, 0.08)',
  blue: '#1d4ed8',
  blueBg: 'rgba(29, 78, 216, 0.08)',
  purple: '#6d28d9',
  purpleBg: 'rgba(109, 40, 217, 0.08)',
  orange: '#c2410c',
  orangeBg: 'rgba(194, 65, 12, 0.08)',
  cyan: '#0e7490',
  cyanBg: 'rgba(14, 116, 144, 0.08)',

  // Background — warm stone neutrals
  bgBase: '#f5f5f4',
  bgLayout: '#f5f5f4',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  bgSpotlight: '#e7e5e4',
  bgMask: 'rgba(28, 25, 23, 0.45)',

  // Text — warm ink
  text: '#1c1917',
  textSecondary: '#57534e',
  textTertiary: '#a8a29e',
  textQuaternary: '#d6d3d1',
  textDisabled: '#a8a29e',
  textInverse: '#ffffff',

  // Border
  border: '#e7e5e4',
  borderSecondary: '#f0efed',
  borderHover: '#d6d3d1',
  borderActive: '#a8a29e',

  // Fill
  fill: '#f5f5f4',
  fillSecondary: '#fafaf9',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(28, 25, 23, 0.04)',
  fillLight: 'rgba(28, 25, 23, 0.08)',

  // Link
  link: '#0f766e',
  linkHover: '#115e59',
  linkActive: '#134e4a',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.55)',
  glassLightStrong: 'rgba(255, 255, 255, 0.75)',

  // Interaction states
  hoverOverlay: 'rgba(28, 25, 23, 0.04)',
  activeOverlay: 'rgba(28, 25, 23, 0.08)',
};

export const paperLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#047857', bg: 'rgba(4, 120, 87, 0.08)' },
  phase: { text: '#78716c', bg: 'rgba(120, 113, 108, 0.08)' },
  human: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  tool: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  compressing: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  skill: { text: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  llm: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  thinking: { text: '#be185d', bg: 'rgba(190, 24, 93, 0.08)' },
  token: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
};

export const paperLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#a8a29e', bg: 'rgba(168, 162, 158, 0.1)' },
  running: { text: '#047857', bg: 'rgba(4, 120, 87, 0.08)' },
  paused: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  completed: { text: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.08)' },
};

export const paperLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#78716c', bg: 'rgba(120, 113, 108, 0.08)' },
  loaded: { text: '#047857', bg: 'rgba(4, 120, 87, 0.08)' },
  active: { text: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.08)' },
  completed: { text: '#047857', bg: 'rgba(4, 120, 87, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
};

export const paperDarkColor: Theme['color'] = {
  // Brand — teal-600 keeps white text legible and stays calm on warm dark
  primary: '#0d9488',
  primaryHover: '#14b8a6',
  primaryActive: '#0f766e',
  primaryBg: 'rgba(20, 184, 166, 0.15)',

  // Semantic
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.12)',
  successBorder: 'rgba(74, 222, 128, 0.25)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.12)',
  warningBorder: 'rgba(251, 191, 36, 0.25)',
  error: '#f87171',
  errorBg: 'rgba(248, 113, 113, 0.12)',
  errorBorder: 'rgba(248, 113, 113, 0.25)',
  info: '#0d9488',
  infoBg: 'rgba(20, 184, 166, 0.15)',
  infoBorder: 'rgba(20, 184, 166, 0.25)',

  // Extended colors
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.12)',
  blue: '#60a5fa',
  blueBg: 'rgba(96, 165, 250, 0.12)',
  purple: '#a78bfa',
  purpleBg: 'rgba(167, 139, 250, 0.12)',
  orange: '#fb923c',
  orangeBg: 'rgba(251, 146, 60, 0.12)',
  cyan: '#22d3ee',
  cyanBg: 'rgba(34, 211, 238, 0.12)',

  // Background — warm charcoal (stone scale), not blue-black
  bgBase: '#1c1917',
  bgLayout: '#1c1917',
  bgContainer: '#292524',
  bgElevated: '#44403c',
  bgSpotlight: '#292524',
  bgMask: 'rgba(0, 0, 0, 0.6)',

  // Text
  text: '#f5f5f4',
  textSecondary: '#a8a29e',
  textTertiary: '#78716c',
  textQuaternary: '#57534e',
  textDisabled: '#57534e',
  textInverse: '#1c1917',

  // Border
  border: '#44403c',
  borderSecondary: '#292524',
  borderHover: '#57534e',
  borderActive: '#78716c',

  // Fill
  fill: '#292524',
  fillSecondary: '#1c1917',
  fillTertiary: '#44403c',
  fillSubtle: 'rgba(255, 255, 255, 0.04)',
  fillLight: 'rgba(255, 255, 255, 0.08)',

  // Link
  link: '#14b8a6',
  linkHover: '#2dd4bf',
  linkActive: '#0d9488',

  // Glass effect
  glassLight: 'rgba(41, 37, 36, 0.6)',
  glassLightStrong: 'rgba(41, 37, 36, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.04)',
  activeOverlay: 'rgba(255, 255, 255, 0.08)',
};

export const paperDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  phase: { text: '#a8a29e', bg: 'rgba(168, 162, 158, 0.15)' },
  human: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  tool: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  compressing: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  skill: { text: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  llm: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  thinking: { text: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' },
  token: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
};

export const paperDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#78716c', bg: 'rgba(120, 113, 108, 0.15)' },
  running: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  paused: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  completed: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
};

export const paperDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#a8a29e', bg: 'rgba(168, 162, 158, 0.15)' },
  loaded: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  active: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  completed: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
};

export const paperLightTheme: Theme = {
  mode: 'light',
  color: paperLightColor,
  eventStatusColor: paperLightEventStatusColor,
  agentStatusColor: paperLightAgentStatusColor,
  skillStatusColor: paperLightSkillStatusColor,
  spacing,
  radius,
  shadow: paperShadow,
  blur,
  motion,
  font,
  icon,
};

export const paperDarkTheme: Theme = {
  mode: 'dark',
  color: paperDarkColor,
  eventStatusColor: paperDarkEventStatusColor,
  agentStatusColor: paperDarkAgentStatusColor,
  skillStatusColor: paperDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
