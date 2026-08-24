/**
 * Blossom theme (樱) — cherry-blossom pastel: cream pink, rose, soft violet.
 *
 * Light mode is petals in daylight: cream-pink surfaces, a rose primary, warm
 * brown ink and violet links. Dark mode is night sakura: deep plum ground with
 * a luminous pink primary.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Plum-tinted light shadows (rgb 67,39,47) */
const blossomShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(67, 39, 47, 0.06)',
  base: '0 1px 3px rgba(67, 39, 47, 0.08)',
  md: '0 2px 4px rgba(67, 39, 47, 0.06), 0 4px 12px rgba(67, 39, 47, 0.08)',
  lg: '0 4px 8px rgba(67, 39, 47, 0.08), 0 8px 24px rgba(67, 39, 47, 0.1)',
  xl: '0 8px 16px rgba(67, 39, 47, 0.08), 0 16px 40px rgba(67, 39, 47, 0.12)',
};

export const blossomLightColor: Theme['color'] = {
  // Brand — rose, sakura pink deepened for contrast
  primary: '#c9366f',
  primaryHover: '#d64c82',
  primaryActive: '#ad2d61',
  primaryBg: 'rgba(201, 54, 111, 0.08)',

  // Semantic — soft hues kept deep enough for small text
  success: '#1f7a55',
  successBg: 'rgba(31, 122, 85, 0.08)',
  successBorder: 'rgba(31, 122, 85, 0.25)',
  warning: '#b45309',
  warningBg: 'rgba(180, 83, 9, 0.08)',
  warningBorder: 'rgba(180, 83, 9, 0.25)',
  error: '#c53348',
  errorBg: 'rgba(197, 51, 72, 0.08)',
  errorBorder: 'rgba(197, 51, 72, 0.25)',
  info: '#0f766e',
  infoBg: 'rgba(15, 118, 110, 0.08)',
  infoBorder: 'rgba(15, 118, 110, 0.25)',

  // Extended colors
  green: '#1f7a55',
  greenBg: 'rgba(31, 122, 85, 0.08)',
  blue: '#6d28d9',
  blueBg: 'rgba(109, 40, 217, 0.08)',
  purple: '#a21caf',
  purpleBg: 'rgba(162, 28, 175, 0.08)',
  orange: '#c2410c',
  orangeBg: 'rgba(194, 65, 12, 0.08)',
  cyan: '#0e7490',
  cyanBg: 'rgba(14, 116, 144, 0.08)',

  // Background — cream pink
  bgBase: '#fdf8f9',
  bgLayout: '#fdf8f9',
  bgContainer: '#ffffff',
  bgElevated: '#ffffff',
  bgSpotlight: '#f8eef1',
  bgMask: 'rgba(67, 39, 47, 0.5)',

  // Text — warm brown ink, softer than pure black on pink
  text: '#43272f',
  textSecondary: '#6e4a54',
  textTertiary: '#a07e88',
  textQuaternary: '#ecd9de',
  textDisabled: '#c9abb3',
  textInverse: '#ffffff',

  // Border
  border: '#f0dde2',
  borderSecondary: '#f6eaed',
  borderHover: '#dfc3cb',
  borderActive: '#c9abb3',

  // Fill
  fill: '#f9eff2',
  fillSecondary: '#fdf8f9',
  fillTertiary: '#ffffff',
  fillSubtle: 'rgba(67, 39, 47, 0.04)',
  fillLight: 'rgba(67, 39, 47, 0.08)',

  // Link — soft violet, a companion bloom to the rose
  link: '#9333ea',
  linkHover: '#7e22ce',
  linkActive: '#6b21a8',

  // Glass effect
  glassLight: 'rgba(255, 255, 255, 0.6)',
  glassLightStrong: 'rgba(255, 255, 255, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(67, 39, 47, 0.05)',
  activeOverlay: 'rgba(67, 39, 47, 0.09)',
};

export const blossomLightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  plan: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  toolMcp: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  toolScript: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  toolBuiltin: { text: '#1f7a55', bg: 'rgba(31, 122, 85, 0.08)' },
  humanInput: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  skill: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  a2ui: { text: '#0c4a6e', bg: 'rgba(12, 74, 110, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  todo: { text: '#be185d', bg: 'rgba(190, 24, 93, 0.08)' },
};

export const blossomLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#1f7a55', bg: 'rgba(31, 122, 85, 0.08)' },
  phase: { text: '#6e4a54', bg: 'rgba(110, 74, 84, 0.08)' },
  human: { text: '#c2410c', bg: 'rgba(194, 65, 12, 0.08)' },
  tool: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#c53348', bg: 'rgba(197, 51, 72, 0.08)' },
  compressing: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  skill: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  subagent: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
  llm: { text: '#a21caf', bg: 'rgba(162, 28, 175, 0.08)' },
  thinking: { text: '#9d174d', bg: 'rgba(157, 23, 77, 0.08)' },
  token: { text: '#0e7490', bg: 'rgba(14, 116, 144, 0.08)' },
};

export const blossomLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#c9abb3', bg: 'rgba(201, 171, 179, 0.1)' },
  running: { text: '#1f7a55', bg: 'rgba(31, 122, 85, 0.08)' },
  paused: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#c53348', bg: 'rgba(197, 51, 72, 0.08)' },
  completed: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
};

export const blossomLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#a07e88', bg: 'rgba(160, 126, 136, 0.08)' },
  loaded: { text: '#1f7a55', bg: 'rgba(31, 122, 85, 0.08)' },
  active: { text: '#6d28d9', bg: 'rgba(109, 40, 217, 0.08)' },
  completed: { text: '#1f7a55', bg: 'rgba(31, 122, 85, 0.08)' },
  error: { text: '#c53348', bg: 'rgba(197, 51, 72, 0.08)' },
};

export const blossomDarkColor: Theme['color'] = {
  // Brand — luminous pink on plum night
  primary: '#f472b6',
  primaryHover: '#f9a8d4',
  primaryActive: '#ec4899',
  primaryBg: 'rgba(244, 114, 182, 0.15)',

  // Semantic
  success: '#6ee7b7',
  successBg: 'rgba(110, 231, 183, 0.15)',
  successBorder: 'rgba(110, 231, 183, 0.3)',
  warning: '#fcd34d',
  warningBg: 'rgba(252, 211, 77, 0.15)',
  warningBorder: 'rgba(252, 211, 77, 0.3)',
  error: '#fb7185',
  errorBg: 'rgba(251, 113, 133, 0.15)',
  errorBorder: 'rgba(251, 113, 133, 0.3)',
  info: '#c4b5fd',
  infoBg: 'rgba(196, 181, 253, 0.15)',
  infoBorder: 'rgba(196, 181, 253, 0.3)',

  // Extended colors — moonlit pastels
  green: '#6ee7b7',
  greenBg: 'rgba(110, 231, 183, 0.15)',
  blue: '#a5b4fc',
  blueBg: 'rgba(165, 180, 252, 0.15)',
  purple: '#d8b4fe',
  purpleBg: 'rgba(216, 180, 254, 0.15)',
  orange: '#fdba74',
  orangeBg: 'rgba(253, 186, 116, 0.15)',
  cyan: '#7dd3fc',
  cyanBg: 'rgba(125, 211, 252, 0.15)',

  // Background — deep plum
  bgBase: '#1e1620',
  bgLayout: '#1e1620',
  bgContainer: '#271e2a',
  bgElevated: '#342838',
  bgSpotlight: '#271e2a',
  bgMask: 'rgba(0, 0, 0, 0.7)',

  // Text — pale petals on plum
  text: '#f8eff3',
  textSecondary: '#d0b8c2',
  textTertiary: '#9d8492',
  textQuaternary: '#655264',
  textDisabled: '#655264',
  textInverse: '#33101f',

  // Border
  border: '#3e2f42',
  borderSecondary: '#2a2230',
  borderHover: '#52415a',
  borderActive: '#776180',

  // Fill
  fill: '#271e2a',
  fillSecondary: '#1e1620',
  fillTertiary: '#342838',
  fillSubtle: 'rgba(255, 255, 255, 0.05)',
  fillLight: 'rgba(255, 255, 255, 0.09)',

  // Link — violet luminous
  link: '#c084fc',
  linkHover: '#d8b4fe',
  linkActive: '#a855f7',

  // Glass effect
  glassLight: 'rgba(39, 30, 42, 0.6)',
  glassLightStrong: 'rgba(39, 30, 42, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.05)',
  activeOverlay: 'rgba(255, 255, 255, 0.09)',
};

export const blossomDarkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  plan: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  toolMcp: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  toolScript: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  toolBuiltin: { text: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.15)' },
  humanInput: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  skill: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  a2ui: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  subagent: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  todo: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
};

export const blossomDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.15)' },
  phase: { text: '#d0b8c2', bg: 'rgba(208, 184, 194, 0.15)' },
  human: { text: '#fdba74', bg: 'rgba(253, 186, 116, 0.15)' },
  tool: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  compressing: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  skill: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  subagent: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  llm: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  thinking: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
  token: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
};

export const blossomDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#9d8492', bg: 'rgba(157, 132, 146, 0.15)' },
  running: { text: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.15)' },
  paused: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
  completed: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
};

export const blossomDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#d0b8c2', bg: 'rgba(208, 184, 194, 0.15)' },
  loaded: { text: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.15)' },
  active: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  completed: { text: '#6ee7b7', bg: 'rgba(110, 231, 183, 0.15)' },
  error: { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)' },
};

export const blossomLightTheme: Theme = {
  mode: 'light',
  color: blossomLightColor,
  blockColor: blossomLightBlockColor,
  eventStatusColor: blossomLightEventStatusColor,
  agentStatusColor: blossomLightAgentStatusColor,
  skillStatusColor: blossomLightSkillStatusColor,
  spacing,
  radius,
  shadow: blossomShadow,
  blur,
  motion,
  font,
  icon,
};

export const blossomDarkTheme: Theme = {
  mode: 'dark',
  color: blossomDarkColor,
  blockColor: blossomDarkBlockColor,
  eventStatusColor: blossomDarkEventStatusColor,
  agentStatusColor: blossomDarkAgentStatusColor,
  skillStatusColor: blossomDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
