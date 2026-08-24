/**
 * Neon theme (霓) — synthwave: violet night, neon pink, cyan accents.
 *
 * Dark mode is the signature look: deep violet-black ground, hot-pink primary
 * and a cyan link/highlight pairing. Light mode is "daywave" — pale lavender
 * surfaces with a magenta primary and the same cyan accent.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Violet-tinted light shadows (rgb 34,24,53) */
const neonShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(34, 24, 53, 0.07)',
  base: '0 1px 3px rgba(34, 24, 53, 0.09)',
  md: '0 2px 4px rgba(34, 24, 53, 0.07), 0 4px 12px rgba(34, 24, 53, 0.09)',
  lg: '0 4px 8px rgba(34, 24, 53, 0.09), 0 8px 24px rgba(34, 24, 53, 0.11)',
  xl: '0 8px 16px rgba(34, 24, 53, 0.09), 0 16px 40px rgba(34, 24, 53, 0.13)',
};

export const neonLightColor: Theme['color'] = {
  // Brand — magenta, daylight-safe depth
  primary: '#d61f7f',
  primaryHover: '#dd408f',
  primaryActive: '#b81a6c',
  primaryBg: 'rgba(214, 31, 127, 0.08)',

  // Semantic
  success: '#15803d',
  successBg: 'rgba(21, 128, 61, 0.08)',
  successBorder: 'rgba(21, 128, 61, 0.25)',
  warning: '#b45309',
  warningBg: 'rgba(180, 83, 9, 0.08)',
  warningBorder: 'rgba(180, 83, 9, 0.25)',
  error: '#be123c',
  errorBg: 'rgba(190, 18, 60, 0.08)',
  errorBorder: 'rgba(190, 18, 60, 0.25)',
  info: '#0e7490',
  infoBg: 'rgba(14, 116, 144, 0.08)',
  infoBorder: 'rgba(14, 116, 144, 0.25)',

  // Extended colors
  green: '#15803d',
  greenBg: 'rgba(21, 128, 61, 0.08)',
  blue: '#6d28d9',
  blueBg: 'rgba(109, 40, 217, 0.08)',
  purple: '#a21caf',
  purpleBg: 'rgba(162, 28, 175, 0.08)',
  orange: '#c2410c',
  orangeBg: 'rgba(194, 65, 12, 0.08)',
  cyan: '#0e7490',
  cyanBg: 'rgba(14, 116, 144, 0.08)',

  // Background — pale lavender
  bgBase: '#f6f3fc',
  bgLayout: '#f6f3fc',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  bgSpotlight: '#ebe6f7',
  bgMask: 'rgba(24, 16, 43, 0.5)',

  // Text — violet-black
  text: '#221835',
  textSecondary: '#4b4064',
  textTertiary: '#7a6f94',
  textQuaternary: '#d9d3e8',
  textDisabled: '#a79dba',
  textInverse: '#ffffff',

  // Border
  border: '#e4def0',
  borderSecondary: '#efebf7',
  borderHover: '#c8c0dc',
  borderActive: '#a79dba',

  // Fill
  fill: '#f0ebf8',
  fillSecondary: '#f6f3fc',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(34, 24, 53, 0.04)',
  fillLight: 'rgba(34, 24, 53, 0.08)',

  // Link — cyan, the synthwave counterpoint to the magenta
  link: '#0e7490',
  linkHover: '#0a5c74',
  linkActive: '#074a5c',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.6)',
  glassLightStrong: 'rgba(255, 255, 255, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(34, 24, 53, 0.05)',
  activeOverlay: 'rgba(34, 24, 53, 0.09)',
};

export const neonLightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  plan: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  toolMcp: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  toolScript: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  toolBuiltin: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  humanInput: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  skill: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  a2ui: { text: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  todo: { text: '#be123c', bg: 'rgba(190, 18, 60, 0.08)' },
};

export const neonLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  phase: { text: '#4b4064', bg: 'rgba(75, 64, 100, 0.08)' },
  human: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  tool: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#be123c', bg: 'rgba(190, 18, 60, 0.08)' },
  compressing: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  skill: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  llm: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  thinking: { text: '#be123c', bg: 'rgba(190, 18, 60, 0.08)' },
  token: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
};

export const neonLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#a79dba', bg: 'rgba(167, 157, 186, 0.1)' },
  running: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  paused: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#be123c', bg: 'rgba(190, 18, 60, 0.08)' },
  completed: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
};

export const neonLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#7a6f94', bg: 'rgba(122, 111, 148, 0.08)' },
  loaded: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  active: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  completed: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  error: { text: '#be123c', bg: 'rgba(190, 18, 60, 0.08)' },
};

export const neonDarkColor: Theme['color'] = {
  // Brand — hot neon pink on violet night
  primary: '#ff2d95',
  primaryHover: '#ff5ba9',
  primaryActive: '#e01a80',
  primaryBg: 'rgba(255, 45, 149, 0.15)',

  // Semantic
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.15)',
  successBorder: 'rgba(74, 222, 128, 0.3)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  error: '#fb7185',
  errorBg: 'rgba(251, 113, 133, 0.15)',
  errorBorder: 'rgba(251, 113, 133, 0.3)',
  info: '#22d3ee',
  infoBg: 'rgba(34, 211, 238, 0.15)',
  infoBorder: 'rgba(34, 211, 238, 0.3)',

  // Extended colors — fluorescent grades
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.15)',
  blue: '#818cf8',
  blueBg: 'rgba(129, 140, 248, 0.15)',
  purple: '#e879f9',
  purpleBg: 'rgba(232, 121, 249, 0.15)',
  orange: '#fb923c',
  orangeBg: 'rgba(251, 146, 60, 0.15)',
  cyan: '#22d3ee',
  cyanBg: 'rgba(34, 211, 238, 0.15)',

  // Background — deep violet-black
  bgBase: '#0e0a1e',
  bgLayout: '#0e0a1e',
  bgContainer: '#161029',
  bgElevated: '#1f1838',
  bgSpotlight: '#161029',
  bgMask: 'rgba(0, 0, 0, 0.7)',

  // Text
  text: '#f1ecfa',
  textSecondary: '#bab0d4',
  textTertiary: '#877ba6',
  textQuaternary: '#554b70',
  textDisabled: '#554b70',
  textInverse: '#1c0715',

  // Border
  border: '#332a4f',
  borderSecondary: '#221b3b',
  borderHover: '#483d6b',
  borderActive: '#6f618f',

  // Fill
  fill: '#161029',
  fillSecondary: '#0e0a1e',
  fillTertiary: '#1f1838',
  fillSubtle: 'rgba(255, 255, 255, 0.05)',
  fillLight: 'rgba(255, 255, 255, 0.09)',

  // Link — neon cyan, glowing against the violet
  link: '#22d3ee',
  linkHover: '#67e8f9',
  linkActive: '#06b6d4',

  // Glass effect
  glassLight: 'rgba(22, 16, 41, 0.6)',
  glassLightStrong: 'rgba(22, 16, 41, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.05)',
  activeOverlay: 'rgba(255, 255, 255, 0.09)',
};

export const neonDarkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#e879f9', bg: 'rgba(232, 121, 249, 0.15)' },
  plan: { text: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  toolMcp: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  toolScript: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  toolBuiltin: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  humanInput: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  skill: { text: '#e879f9', bg: 'rgba(232, 121, 249, 0.15)' },
  a2ui: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  todo: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
};

export const neonDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  phase: { text: '#bab0d4', bg: 'rgba(186, 176, 212, 0.15)' },
  human: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  tool: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  compressing: { text: '#e879f9', bg: 'rgba(232, 121, 249, 0.15)' },
  skill: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  llm: { text: '#e879f9', bg: 'rgba(232, 121, 249, 0.15)' },
  thinking: { text: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' },
  token: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
};

export const neonDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#877ba6', bg: 'rgba(135, 123, 166, 0.15)' },
  running: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  paused: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  completed: { text: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
};

export const neonDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#bab0d4', bg: 'rgba(186, 176, 212, 0.15)' },
  loaded: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  active: { text: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  completed: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
};

export const neonLightTheme: Theme = {
  mode: 'light',
  color: neonLightColor,
  blockColor: neonLightBlockColor,
  eventStatusColor: neonLightEventStatusColor,
  agentStatusColor: neonLightAgentStatusColor,
  skillStatusColor: neonLightSkillStatusColor,
  spacing,
  radius,
  shadow: neonShadow,
  blur,
  motion,
  font,
  icon,
};

export const neonDarkTheme: Theme = {
  mode: 'dark',
  color: neonDarkColor,
  blockColor: neonDarkBlockColor,
  eventStatusColor: neonDarkEventStatusColor,
  agentStatusColor: neonDarkAgentStatusColor,
  skillStatusColor: neonDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
