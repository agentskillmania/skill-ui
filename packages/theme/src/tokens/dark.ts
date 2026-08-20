/**
 * Dark theme color tokens
 */
import type { Theme } from '../types.js';
import { spacing, radius, darkShadow, blur, motion, font, icon } from './shared.js';

export const darkColor: Theme['color'] = {
  // Brand (primary #6b83f2 blue-purple, brightened in dark mode)
  primary: '#6b83f2',
  primaryHover: '#7d93f5',
  primaryActive: '#5a72e0',
  primaryBg: 'rgba(107, 131, 242, 0.15)',

  // Semantic
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

  // Extended colors
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

  // Background
  bgBase: '#0f172a',
  bgLayout: '#0f172a',
  bgContainer: '#1e293b',
  bgElevated: '#334155',
  bgSpotlight: '#1e293b',
  bgMask: 'rgba(0, 0, 0, 0.6)',

  // Text
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textQuaternary: '#475569',
  textDisabled: '#475569',
  textInverse: '#0f172a',

  // Border
  border: '#334155',
  borderSecondary: '#1e293b',
  borderHover: '#475569',
  borderActive: '#64748b',

  // Fill
  fill: '#1e293b',
  fillSecondary: '#0f172a',
  fillTertiary: '#334155',
  fillSubtle: 'rgba(255, 255, 255, 0.04)',
  fillLight: 'rgba(255, 255, 255, 0.08)',

  // Link
  link: '#6b83f2',
  linkHover: '#7d93f5',
  linkActive: '#5a72e0',

  // Glass effect
  glassLight: 'rgba(30, 41, 59, 0.6)',
  glassLightStrong: 'rgba(30, 41, 59, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.04)',
  activeOverlay: 'rgba(255, 255, 255, 0.08)',
};

export const darkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  plan: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  toolMcp: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  toolScript: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  toolBuiltin: { text: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  humanInput: { text: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' },
  skill: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  a2ui: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  subagent: { text: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' },
  todo: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
};

export const darkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  phase: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
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

export const darkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  running: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  paused: { text: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  completed: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
};

export const darkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  loaded: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  active: { text: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
  completed: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
};

export const darkTheme: Theme = {
  mode: 'dark',
  color: darkColor,
  blockColor: darkBlockColor,
  eventStatusColor: darkEventStatusColor,
  agentStatusColor: darkAgentStatusColor,
  skillStatusColor: darkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
