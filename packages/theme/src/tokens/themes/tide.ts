/**
 * Tide theme (汐) — open sea: deep ocean blue, moonlit teal accents.
 *
 * Light mode is sea mist: cool blue-tinted whites with a deep-sea-blue primary
 * and moonlit-teal links. Dark mode is the night ocean: deep blue-black water
 * with a luminous sky-blue primary.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Deep-sea blue-black light shadows (rgb 10,21,36) */
const tideShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(10, 21, 36, 0.07)',
  base: '0 1px 3px rgba(10, 21, 36, 0.09)',
  md: '0 2px 4px rgba(10, 21, 36, 0.07), 0 4px 12px rgba(10, 21, 36, 0.09)',
  lg: '0 4px 8px rgba(10, 21, 36, 0.09), 0 8px 24px rgba(10, 21, 36, 0.11)',
  xl: '0 8px 16px rgba(10, 21, 36, 0.09), 0 16px 40px rgba(10, 21, 36, 0.13)',
};

export const tideLightColor: Theme['color'] = {
  // Brand — deep sea blue
  primary: '#0c6291',
  primaryHover: '#1173a8',
  primaryActive: '#094e71',
  primaryBg: 'rgba(12, 98, 145, 0.08)',

  // Semantic
  success: '#15803d',
  successBg: 'rgba(21, 128, 61, 0.08)',
  successBorder: 'rgba(21, 128, 61, 0.25)',
  warning: '#b45309',
  warningBg: 'rgba(180, 83, 9, 0.08)',
  warningBorder: 'rgba(180, 83, 9, 0.25)',
  error: '#b91c1c',
  errorBg: 'rgba(185, 28, 28, 0.08)',
  errorBorder: 'rgba(185, 28, 28, 0.25)',
  info: '#0c6291',
  infoBg: 'rgba(12, 98, 145, 0.08)',
  infoBorder: 'rgba(12, 98, 145, 0.25)',

  // Extended colors
  green: '#15803d',
  greenBg: 'rgba(21, 128, 61, 0.08)',
  blue: '#1d4ed8',
  blueBg: 'rgba(29, 78, 216, 0.08)',
  purple: '#6d28d9',
  purpleBg: 'rgba(109, 40, 217, 0.08)',
  orange: '#c2410c',
  orangeBg: 'rgba(194, 65, 12, 0.08)',
  cyan: '#0e7490',
  cyanBg: 'rgba(14, 116, 144, 0.08)',

  // Background — sea mist, cool blue-tinted white
  bgBase: '#f3f7fa',
  bgLayout: '#f3f7fa',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  bgSpotlight: '#e6eef4',
  bgMask: 'rgba(10, 21, 36, 0.5)',

  // Text — deep-water ink blue
  text: '#122431',
  textSecondary: '#3c5265',
  textTertiary: '#6c8296',
  textQuaternary: '#d3dde5',
  textDisabled: '#a2b4c2',
  textInverse: '#ffffff',

  // Border
  border: '#dfe8ef',
  borderSecondary: '#eaf1f6',
  borderHover: '#c2d2de',
  borderActive: '#a2b4c2',

  // Fill
  fill: '#ebf2f7',
  fillSecondary: '#f3f7fa',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(18, 36, 49, 0.04)',
  fillLight: 'rgba(18, 36, 49, 0.08)',

  // Link — moonlit teal, moonlight on the water
  link: '#0f766e',
  linkHover: '#115e59',
  linkActive: '#134e4a',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.6)',
  glassLightStrong: 'rgba(255, 255, 255, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(18, 36, 49, 0.05)',
  activeOverlay: 'rgba(18, 36, 49, 0.09)',
};

export const tideLightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  plan: { text: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.08)' },
  toolMcp: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  toolScript: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  toolBuiltin: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  humanInput: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  skill: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  a2ui: { text: '#0c4a6e', bg: 'rgba(12, 74, 110, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  todo: { text: '#9f1239', bg: 'rgba(159, 18, 57, 0.08)' },
};

export const tideLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  phase: { text: '#3c5265', bg: 'rgba(60, 82, 101, 0.08)' },
  human: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  tool: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  compressing: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  skill: { text: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  llm: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  thinking: { text: '#9d174d', bg: 'rgba(157, 23, 77, 0.08)' },
  token: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
};

export const tideLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#a2b4c2', bg: 'rgba(162, 180, 194, 0.1)' },
  running: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  paused: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  completed: { text: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.08)' },
};

export const tideLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#6c8296', bg: 'rgba(108, 130, 150, 0.08)' },
  loaded: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  active: { text: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.08)' },
  completed: { text: '#15803d', bg: 'rgba(21, 128, 61, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
};

export const tideDarkColor: Theme['color'] = {
  // Brand — luminous sky blue, moonlight on night water
  primary: '#38bdf8',
  primaryHover: '#7dd3fc',
  primaryActive: '#0ea5e9',
  primaryBg: 'rgba(56, 189, 248, 0.15)',

  // Semantic
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.15)',
  successBorder: 'rgba(74, 222, 128, 0.3)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  error: '#f87171',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',
  info: '#38bdf8',
  infoBg: 'rgba(56, 189, 248, 0.15)',
  infoBorder: 'rgba(56, 189, 248, 0.3)',

  // Extended colors
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.15)',
  blue: '#93c5fd',
  blueBg: 'rgba(147, 197, 253, 0.15)',
  purple: '#c4b5fd',
  purpleBg: 'rgba(196, 181, 253, 0.15)',
  orange: '#fb923c',
  orangeBg: 'rgba(251, 146, 60, 0.15)',
  cyan: '#22d3ee',
  cyanBg: 'rgba(34, 211, 238, 0.15)',

  // Background — deep blue-black water
  bgBase: '#0a1524',
  bgLayout: '#0a1524',
  bgContainer: '#101f31',
  bgElevated: '#16293f',
  bgSpotlight: '#101f31',
  bgMask: 'rgba(0, 0, 0, 0.7)',

  // Text — pale sea foam
  text: '#eaf2f9',
  textSecondary: '#b0c2d3',
  textTertiary: '#7d92a6',
  textQuaternary: '#4b5e70',
  textDisabled: '#4b5e70',
  textInverse: '#04121f',

  // Border
  border: '#24374a',
  borderSecondary: '#16263a',
  borderHover: '#324a60',
  borderActive: '#4b6884',

  // Fill
  fill: '#101f31',
  fillSecondary: '#0a1524',
  fillTertiary: '#16293f',
  fillSubtle: 'rgba(255, 255, 255, 0.05)',
  fillLight: 'rgba(255, 255, 255, 0.09)',

  // Link — moonlit teal
  link: '#2dd4bf',
  linkHover: '#5eead4',
  linkActive: '#14b8a6',

  // Glass effect
  glassLight: 'rgba(16, 31, 49, 0.6)',
  glassLightStrong: 'rgba(16, 31, 49, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.05)',
  activeOverlay: 'rgba(255, 255, 255, 0.09)',
};

export const tideDarkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  plan: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  toolMcp: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  toolScript: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  toolBuiltin: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  humanInput: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  skill: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  a2ui: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  todo: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
};

export const tideDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  phase: { text: '#b0c2d3', bg: 'rgba(176, 194, 211, 0.15)' },
  human: { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  tool: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  compressing: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  skill: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  llm: { text: '#c4b5fd', bg: 'rgba(196, 181, 253, 0.15)' },
  thinking: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
  token: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
};

export const tideDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#7d92a6', bg: 'rgba(125, 146, 166, 0.15)' },
  running: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  paused: { text: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  completed: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
};

export const tideDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#b0c2d3', bg: 'rgba(176, 194, 211, 0.15)' },
  loaded: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  active: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  completed: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
};

export const tideLightTheme: Theme = {
  mode: 'light',
  color: tideLightColor,
  blockColor: tideLightBlockColor,
  eventStatusColor: tideLightEventStatusColor,
  agentStatusColor: tideLightAgentStatusColor,
  skillStatusColor: tideLightSkillStatusColor,
  spacing,
  radius,
  shadow: tideShadow,
  blur,
  motion,
  font,
  icon,
};

export const tideDarkTheme: Theme = {
  mode: 'dark',
  color: tideDarkColor,
  blockColor: tideDarkBlockColor,
  eventStatusColor: tideDarkEventStatusColor,
  agentStatusColor: tideDarkAgentStatusColor,
  skillStatusColor: tideDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
