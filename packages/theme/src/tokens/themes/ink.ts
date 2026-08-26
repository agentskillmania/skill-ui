/**
 * Ink theme (墨) — rice-paper neutrals, ink-black primary, vermilion accent.
 *
 * Light mode is 宣纸 + 墨: warm paper white, near-black primary buttons, and a
 * single seal-red (朱砂) reserved for links. Dark mode inverts the painting:
 * warm ink-black ground with paper-white primary surfaces.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Ink-tinted light shadows (warm black, rgb 28,25,23) */
const inkShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(28, 25, 23, 0.07)',
  base: '0 1px 3px rgba(28, 25, 23, 0.09)',
  md: '0 2px 4px rgba(28, 25, 23, 0.07), 0 4px 12px rgba(28, 25, 23, 0.09)',
  lg: '0 4px 8px rgba(28, 25, 23, 0.09), 0 8px 24px rgba(28, 25, 23, 0.11)',
  xl: '0 8px 16px rgba(28, 25, 23, 0.09), 0 16px 40px rgba(28, 25, 23, 0.13)',
};

export const inkLightColor: Theme['color'] = {
  // Brand — 墨色, near-black warm ink
  primary: '#1c1917',
  primaryHover: '#292524',
  primaryActive: '#000000',
  primaryBg: 'rgba(28, 25, 23, 0.06)',

  // Semantic — deep, muted tones that sit quietly on paper
  success: '#166534',
  successBg: 'rgba(22, 101, 52, 0.08)',
  successBorder: 'rgba(22, 101, 52, 0.25)',
  warning: '#92400e',
  warningBg: 'rgba(146, 64, 14, 0.08)',
  warningBorder: 'rgba(146, 64, 14, 0.25)',
  error: '#b91c1c',
  errorBg: 'rgba(185, 28, 28, 0.08)',
  errorBorder: 'rgba(185, 28, 28, 0.25)',
  info: '#1c1917',
  infoBg: 'rgba(28, 25, 23, 0.06)',
  infoBorder: 'rgba(28, 25, 23, 0.2)',

  // Extended colors — deep ink-stick hues for chips/tags
  green: '#166534',
  greenBg: 'rgba(22, 101, 52, 0.08)',
  blue: '#1e40af',
  blueBg: 'rgba(30, 64, 175, 0.08)',
  purple: '#5b21b6',
  purpleBg: 'rgba(91, 33, 182, 0.08)',
  orange: '#9a3412',
  orangeBg: 'rgba(154, 52, 18, 0.08)',
  cyan: '#155e75',
  cyanBg: 'rgba(21, 94, 117, 0.08)',

  // Background — 宣纸 warm white
  bgBase: '#f8f7f4',
  bgLayout: '#f8f7f4',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  bgSpotlight: '#ebe9e4',
  bgMask: 'rgba(28, 25, 23, 0.5)',

  // Text — 墨分五色
  text: '#1c1917',
  textSecondary: '#44403c',
  textTertiary: '#78716c',
  textQuaternary: '#d6d3d1',
  textDisabled: '#a8a29e',
  textInverse: '#ffffff',

  // Border — warm, one step stronger than Slate for definition
  border: '#e2dfd9',
  borderSecondary: '#edebe6',
  borderHover: '#c9c4bc',
  borderActive: '#a8a29e',

  // Fill
  fill: '#f0eee9',
  fillSecondary: '#f8f7f4',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(28, 25, 23, 0.04)',
  fillLight: 'rgba(28, 25, 23, 0.08)',

  // Link — 朱砂 seal red, the single accent on the page
  link: '#c2402a',
  linkHover: '#a93324',
  linkActive: '#8f2a1e',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.6)',
  glassLightStrong: 'rgba(255, 255, 255, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(28, 25, 23, 0.05)',
  activeOverlay: 'rgba(28, 25, 23, 0.09)',
};

export const inkLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#166534', bg: 'rgba(22, 101, 52, 0.08)' },
  phase: { text: '#57534e', bg: 'rgba(87, 83, 78, 0.08)' },
  human: { text: '#9a3412', bg: 'rgba(154, 52, 18, 0.08)' },
  tool: { text: '#92400e', bg: 'rgba(146, 64, 14, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  compressing: { text: '#5b21b6', bg: 'rgba(91, 33, 182, 0.08)' },
  skill: { text: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)' },
  subagent: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
  llm: { text: '#5b21b6', bg: 'rgba(91, 33, 182, 0.08)' },
  thinking: { text: '#9d174d', bg: 'rgba(157, 23, 77, 0.08)' },
  token: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
};

export const inkLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#a8a29e', bg: 'rgba(168, 162, 158, 0.1)' },
  running: { text: '#166534', bg: 'rgba(22, 101, 52, 0.08)' },
  paused: { text: '#92400e', bg: 'rgba(146, 64, 14, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  completed: { text: '#1e40af', bg: 'rgba(30, 64, 175, 0.08)' },
};

export const inkLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#57534e', bg: 'rgba(87, 83, 78, 0.08)' },
  loaded: { text: '#166534', bg: 'rgba(22, 101, 52, 0.08)' },
  active: { text: '#1e40af', bg: 'rgba(30, 64, 175, 0.08)' },
  completed: { text: '#166534', bg: 'rgba(22, 101, 52, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
};

export const inkDarkColor: Theme['color'] = {
  // Brand — 宣纸 paper white, the painting inverted
  primary: '#ece9e2',
  primaryHover: '#ffffff',
  primaryActive: '#d6d2c9',
  primaryBg: 'rgba(236, 233, 226, 0.12)',

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
  info: '#ece9e2',
  infoBg: 'rgba(236, 233, 226, 0.12)',
  infoBorder: 'rgba(236, 233, 226, 0.25)',

  // Extended colors
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.12)',
  blue: '#93c5fd',
  blueBg: 'rgba(147, 197, 253, 0.12)',
  purple: '#c4b5fd',
  purpleBg: 'rgba(196, 181, 253, 0.12)',
  orange: '#fdba74',
  orangeBg: 'rgba(253, 186, 116, 0.12)',
  cyan: '#67e8f9',
  cyanBg: 'rgba(103, 232, 249, 0.12)',

  // Background — 松烟墨, warm near-black
  bgBase: '#121110',
  bgLayout: '#121110',
  bgContainer: '#1c1a17',
  bgElevated: '#2a2723',
  bgSpotlight: '#1c1a17',
  bgMask: 'rgba(0, 0, 0, 0.7)',

  // Text — paper white on ink
  text: '#f2f0ec',
  textSecondary: '#b5aea4',
  textTertiary: '#78716c',
  textQuaternary: '#57534e',
  textDisabled: '#57534e',
  textInverse: '#1c1917',

  // Border
  border: '#38342e',
  borderSecondary: '#232019',
  borderHover: '#4c4740',
  borderActive: '#6e675c',

  // Fill
  fill: '#1c1a17',
  fillSecondary: '#121110',
  fillTertiary: '#2a2723',
  fillSubtle: 'rgba(255, 255, 255, 0.05)',
  fillLight: 'rgba(255, 255, 255, 0.09)',

  // Link — 朱砂 brightened for dark ground
  link: '#e4694e',
  linkHover: '#eb8468',
  linkActive: '#cc4f36',

  // Glass effect
  glassLight: 'rgba(28, 26, 23, 0.6)',
  glassLightStrong: 'rgba(28, 26, 23, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.05)',
  activeOverlay: 'rgba(255, 255, 255, 0.09)',
};

export const inkDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  phase: { text: '#b5aea4', bg: 'rgba(181, 174, 164, 0.15)' },
  human: { text: '#fdba74', bg: 'rgba(253, 186, 116, 0.15)' },
  tool: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  compressing: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  skill: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  subagent: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
  llm: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  thinking: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
  token: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
};

export const inkDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#78716c', bg: 'rgba(120, 113, 108, 0.15)' },
  running: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  paused: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  completed: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
};

export const inkDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#b5aea4', bg: 'rgba(181, 174, 164, 0.15)' },
  loaded: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  active: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  completed: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
};

export const inkLightTheme: Theme = {
  mode: 'light',
  color: inkLightColor,
  eventStatusColor: inkLightEventStatusColor,
  agentStatusColor: inkLightAgentStatusColor,
  skillStatusColor: inkLightSkillStatusColor,
  spacing,
  radius,
  shadow: inkShadow,
  blur,
  motion,
  font,
  icon,
};

export const inkDarkTheme: Theme = {
  mode: 'dark',
  color: inkDarkColor,
  eventStatusColor: inkDarkEventStatusColor,
  agentStatusColor: inkDarkAgentStatusColor,
  skillStatusColor: inkDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
