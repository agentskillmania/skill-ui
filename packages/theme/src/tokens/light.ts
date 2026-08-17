/**
 * Light theme color tokens
 */
import type { Theme } from '../types.js';
import { spacing, radius, shadow, blur, motion, font, icon } from './shared.js';

export const lightColor: Theme['color'] = {
  // Brand (primary #4361ee blue-purple)
  primary: '#4361ee',
  primaryHover: '#3651d8',
  primaryActive: '#2a41be',
  primaryBg: 'rgba(67, 97, 238, 0.1)',

  // Semantic
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

  // Extended colors
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

  // Background
  bgBase: '#f8fafc',
  bgLayout: '#f8fafc',
  bgContainer: '#ffffff',
  bgElevated: '#fafafa',
  bgSpotlight: '#f1f5f9',
  bgMask: 'rgba(0, 0, 0, 0.4)',

  // Text
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  textQuaternary: '#cbd5e1',
  textDisabled: '#94a3b8',
  textInverse: '#ffffff',

  // Border
  border: '#e2e8f0',
  borderSecondary: '#f1f5f9',
  borderHover: '#cbd5e1',
  borderActive: '#94a3b8',

  // Fill
  fill: '#f1f5f9',
  fillSecondary: '#f8fafc',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(0, 0, 0, 0.04)',
  fillLight: 'rgba(0, 0, 0, 0.08)',

  // Link
  link: '#4361ee',
  linkHover: '#3651d8',
  linkActive: '#2a41be',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.5)',
  glassLightStrong: 'rgba(255, 255, 255, 0.7)',

  // Interaction states
  hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  activeOverlay: 'rgba(0, 0, 0, 0.08)',
};

export const lightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#7c3aed', bg: 'rgba(124, 58, 237, 0.10)' },
  plan: { text: '#2563eb', bg: 'rgba(37, 99, 235, 0.10)' },
  toolMcp: { text: '#0891b2', bg: 'rgba(8, 145, 178, 0.10)' },
  toolScript: { text: '#d97706', bg: 'rgba(217, 119, 6, 0.10)' },
  toolBuiltin: { text: '#059669', bg: 'rgba(5, 150, 105, 0.10)' },
  humanInput: { text: '#ca8a04', bg: 'rgba(202, 138, 4, 0.10)' },
  skill: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.10)' },
  a2ui: { text: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.10)' },
  subagent: { text: '#0891b2', bg: 'rgba(8, 145, 178, 0.10)' },
};

export const lightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  phase: { text: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  human: { text: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  tool: { text: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  error: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  compressing: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  skill: { text: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
  subagent: { text: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  llm: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  thinking: { text: '#db2777', bg: 'rgba(219, 39, 119, 0.1)' },
  token: { text: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
};

export const lightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' },
  running: { text: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  paused: { text: '#ca8a04', bg: 'rgba(202, 138, 4, 0.1)' },
  error: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  completed: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
};

export const lightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  loaded: { text: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  active: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  completed: { text: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  error: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

export const lightTheme: Theme = {
  mode: 'light',
  color: lightColor,
  blockColor: lightBlockColor,
  eventStatusColor: lightEventStatusColor,
  agentStatusColor: lightAgentStatusColor,
  skillStatusColor: lightSkillStatusColor,
  spacing,
  radius,
  shadow,
  blur,
  motion,
  font,
  icon,
};
