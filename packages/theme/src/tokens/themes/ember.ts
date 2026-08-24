/**
 * Ember theme (烬) — firelight: warm whites, charred browns, fire-orange.
 *
 * Light mode is hearth-light: warm white surfaces with a burnt-orange primary
 * and amber links. Dark mode is embers in the dark: charred brown-black ground
 * with a glowing orange primary.
 */
import type { Theme } from '../../types.js';
import { spacing, radius, blur, motion, font, icon, darkShadow } from '../shared.js';

/** Warm brown-black light shadows (rgb 41,32,24) */
const emberShadow: Theme['shadow'] = {
  sm: '0 1px 2px rgba(41, 32, 24, 0.07)',
  base: '0 1px 3px rgba(41, 32, 24, 0.09)',
  md: '0 2px 4px rgba(41, 32, 24, 0.07), 0 4px 12px rgba(41, 32, 24, 0.09)',
  lg: '0 4px 8px rgba(41, 32, 24, 0.09), 0 8px 24px rgba(41, 32, 24, 0.11)',
  xl: '0 8px 16px rgba(41, 32, 24, 0.09), 0 16px 40px rgba(41, 32, 24, 0.13)',
};

export const emberLightColor: Theme['color'] = {
  // Brand — burnt orange
  primary: '#c2410c',
  primaryHover: '#d24f17',
  primaryActive: '#9a3412',
  primaryBg: 'rgba(194, 65, 12, 0.08)',

  // Semantic
  success: '#4d7c0f',
  successBg: 'rgba(77, 124, 15, 0.08)',
  successBorder: 'rgba(77, 124, 15, 0.25)',
  warning: '#b45309',
  warningBg: 'rgba(180, 83, 9, 0.08)',
  warningBorder: 'rgba(180, 83, 9, 0.25)',
  error: '#b91c1c',
  errorBg: 'rgba(185, 28, 28, 0.08)',
  errorBorder: 'rgba(185, 28, 28, 0.25)',
  info: '#1e40af',
  infoBg: 'rgba(30, 64, 175, 0.08)',
  infoBorder: 'rgba(30, 64, 175, 0.25)',

  // Extended colors
  green: '#4d7c0f',
  greenBg: 'rgba(77, 124, 15, 0.08)',
  blue: '#1e40af',
  blueBg: 'rgba(30, 64, 175, 0.08)',
  purple: '#6b21a8',
  purpleBg: 'rgba(107, 33, 168, 0.08)',
  orange: '#c2410c',
  orangeBg: 'rgba(194, 65, 12, 0.08)',
  cyan: '#155e75',
  cyanBg: 'rgba(21, 94, 117, 0.08)',

  // Background — warm white, hearth-lit
  bgBase: '#faf5ee',
  bgLayout: '#faf5ee',
  bgContainer: '#fffdf8',
  bgElevated: '#fffdf8',
  bgSpotlight: '#f0e7d8',
  bgMask: 'rgba(41, 32, 24, 0.5)',

  // Text — warm black
  text: '#292018',
  textSecondary: '#5a4a3a',
  textTertiary: '#8c7a67',
  textQuaternary: '#e2d7c6',
  textDisabled: '#b6a691',
  textInverse: '#ffffff',

  // Border
  border: '#e9dece',
  borderSecondary: '#f1eade',
  borderHover: '#d0c0a8',
  borderActive: '#b6a691',

  // Fill
  fill: '#f3ebdf',
  fillSecondary: '#faf5ee',
  fillTertiary: '#fffdf8',
  fillSubtle: 'rgba(41, 32, 24, 0.04)',
  fillLight: 'rgba(41, 32, 24, 0.08)',

  // Link — amber
  link: '#b45309',
  linkHover: '#92400e',
  linkActive: '#78350f',

  // Glass effect
  glassLight: 'rgba(255, 253, 248, 0.6)',
  glassLightStrong: 'rgba(255, 253, 248, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(41, 32, 24, 0.05)',
  activeOverlay: 'rgba(41, 32, 24, 0.09)',
};

export const emberLightBlockColor: Theme['blockColor'] = {
  thinking: { text: '#6b21a8', bg: 'rgba(107, 33, 168, 0.08)' },
  plan: { text: '#1e40af', bg: 'rgba(30, 64, 175, 0.08)' },
  toolMcp: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
  toolScript: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  toolBuiltin: { text: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.08)' },
  humanInput: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  skill: { text: '#6b21a8', bg: 'rgba(107, 33, 168, 0.08)' },
  a2ui: { text: '#0c4a6e', bg: 'rgba(12, 74, 110, 0.08)' },
  subagent: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
  todo: { text: '#9f1239', bg: 'rgba(159, 18, 57, 0.08)' },
};

export const emberLightEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.08)' },
  phase: { text: '#5a4a3a', bg: 'rgba(90, 74, 58, 0.08)' },
  human: { text: '#9a3412', bg: 'rgba(154, 52, 18, 0.08)' },
  tool: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  compressing: { text: '#6b21a8', bg: 'rgba(107, 33, 168, 0.08)' },
  skill: { text: '#4338ca', bg: 'rgba(67, 56, 202, 0.08)' },
  subagent: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
  llm: { text: '#6b21a8', bg: 'rgba(107, 33, 168, 0.08)' },
  thinking: { text: '#9d174d', bg: 'rgba(157, 23, 77, 0.08)' },
  token: { text: '#155e75', bg: 'rgba(21, 94, 117, 0.08)' },
};

export const emberLightAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#b6a691', bg: 'rgba(182, 166, 145, 0.1)' },
  running: { text: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.08)' },
  paused: { text: '#b45309', bg: 'rgba(180, 83, 9, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
  completed: { text: '#1e40af', bg: 'rgba(30, 64, 175, 0.08)' },
};

export const emberLightSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#8c7a67', bg: 'rgba(140, 122, 103, 0.08)' },
  loaded: { text: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.08)' },
  active: { text: '#1e40af', bg: 'rgba(30, 64, 175, 0.08)' },
  completed: { text: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.08)' },
  error: { text: '#b91c1c', bg: 'rgba(185, 28, 28, 0.08)' },
};

export const emberDarkColor: Theme['color'] = {
  // Brand — glowing orange against charred ground
  primary: '#fb923c',
  primaryHover: '#fdba74',
  primaryActive: '#f97316',
  primaryBg: 'rgba(251, 146, 60, 0.15)',

  // Semantic
  success: '#86efac',
  successBg: 'rgba(134, 239, 172, 0.15)',
  successBorder: 'rgba(134, 239, 172, 0.3)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  error: '#f87171',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',
  info: '#93c5fd',
  infoBg: 'rgba(147, 197, 253, 0.15)',
  infoBorder: 'rgba(147, 197, 253, 0.3)',

  // Extended colors
  green: '#86efac',
  greenBg: 'rgba(134, 239, 172, 0.15)',
  blue: '#93c5fd',
  blueBg: 'rgba(147, 197, 253, 0.15)',
  purple: '#d8b4fe',
  purpleBg: 'rgba(216, 180, 254, 0.15)',
  orange: '#fdba74',
  orangeBg: 'rgba(253, 186, 116, 0.15)',
  cyan: '#67e8f9',
  cyanBg: 'rgba(103, 232, 249, 0.15)',

  // Background — charred brown-black
  bgBase: '#17110c',
  bgLayout: '#17110c',
  bgContainer: '#20180f',
  bgElevated: '#2b2114',
  bgSpotlight: '#20180f',
  bgMask: 'rgba(0, 0, 0, 0.7)',

  // Text — candlelight warm
  text: '#f8f2e9',
  textSecondary: '#cfc0ac',
  textTertiary: '#9c8b74',
  textQuaternary: '#635440',
  textDisabled: '#635440',
  textInverse: '#2b1505',

  // Border
  border: '#3c3021',
  borderSecondary: '#281f14',
  borderHover: '#51422d',
  borderActive: '#746249',

  // Fill
  fill: '#20180f',
  fillSecondary: '#17110c',
  fillTertiary: '#2b2114',
  fillSubtle: 'rgba(255, 255, 255, 0.05)',
  fillLight: 'rgba(255, 255, 255, 0.09)',

  // Link — amber glow
  link: '#fbbf24',
  linkHover: '#fde68a',
  linkActive: '#f59e0b',

  // Glass effect
  glassLight: 'rgba(32, 24, 15, 0.6)',
  glassLightStrong: 'rgba(32, 24, 15, 0.8)',

  // Interaction states
  hoverOverlay: 'rgba(255, 255, 255, 0.05)',
  activeOverlay: 'rgba(255, 255, 255, 0.09)',
};

export const emberDarkBlockColor: Theme['blockColor'] = {
  thinking: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  plan: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  toolMcp: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
  toolScript: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  toolBuiltin: { text: '#86efac', bg: 'rgba(134, 239, 172, 0.15)' },
  humanInput: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  skill: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  a2ui: { text: '#7dd3fc', bg: 'rgba(125, 211, 252, 0.15)' },
  subagent: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
  todo: { text: '#fda4af', bg: 'rgba(253, 164, 175, 0.15)' },
};

export const emberDarkEventStatusColor: Theme['eventStatusColor'] = {
  lifecycle: { text: '#86efac', bg: 'rgba(134, 239, 172, 0.15)' },
  phase: { text: '#cfc0ac', bg: 'rgba(207, 192, 172, 0.15)' },
  human: { text: '#fdba74', bg: 'rgba(253, 186, 116, 0.15)' },
  tool: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  compressing: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  skill: { text: '#a5b4fc', bg: 'rgba(165, 180, 252, 0.15)' },
  subagent: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
  llm: { text: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)' },
  thinking: { text: '#f9a8d4', bg: 'rgba(249, 168, 212, 0.15)' },
  token: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)' },
};

export const emberDarkAgentStatusColor: Theme['agentStatusColor'] = {
  idle: { text: '#9c8b74', bg: 'rgba(156, 139, 116, 0.15)' },
  running: { text: '#86efac', bg: 'rgba(134, 239, 172, 0.15)' },
  paused: { text: '#fde68a', bg: 'rgba(253, 230, 138, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  completed: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
};

export const emberDarkSkillStatusColor: Theme['skillStatusColor'] = {
  loading: { text: '#cfc0ac', bg: 'rgba(207, 192, 172, 0.15)' },
  loaded: { text: '#86efac', bg: 'rgba(134, 239, 172, 0.15)' },
  active: { text: '#93c5fd', bg: 'rgba(147, 197, 253, 0.15)' },
  completed: { text: '#86efac', bg: 'rgba(134, 239, 172, 0.15)' },
  error: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
};

export const emberLightTheme: Theme = {
  mode: 'light',
  color: emberLightColor,
  blockColor: emberLightBlockColor,
  eventStatusColor: emberLightEventStatusColor,
  agentStatusColor: emberLightAgentStatusColor,
  skillStatusColor: emberLightSkillStatusColor,
  spacing,
  radius,
  shadow: emberShadow,
  blur,
  motion,
  font,
  icon,
};

export const emberDarkTheme: Theme = {
  mode: 'dark',
  color: emberDarkColor,
  blockColor: emberDarkBlockColor,
  eventStatusColor: emberDarkEventStatusColor,
  agentStatusColor: emberDarkAgentStatusColor,
  skillStatusColor: emberDarkSkillStatusColor,
  spacing,
  radius,
  shadow: darkShadow,
  blur,
  motion,
  font,
  icon,
};
