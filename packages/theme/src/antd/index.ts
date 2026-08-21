/**
 * Ant Design / Ant Design X theme config mapping
 */
import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

import { lightTheme, darkTheme, getTheme, type ThemeId } from '../tokens/index.js';
import type { Theme } from '../types.js';

/// "#0f766e" → [15, 118, 110]. Returns null for non-hex input (caller falls
/// back to antd's own derivation).
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/// Opaque tint: primary mixed over the container background by ratio k.
function mixOver(fg: [number, number, number], bg: [number, number, number], k: number): string {
  const m = (a: number, b: number) => Math.round(a * k + b * (1 - k));
  return `rgb(${m(fg[0], bg[0])}, ${m(fg[1], bg[1])}, ${m(fg[2], bg[2])})`;
}

/**
 * Primary-derivation correction for low-luminance primaries + Menu selected
 * state. Returns null (antd defaults stay) when colors aren't parseable hex.
 *
 * Why: antd derives the tint family (colorPrimaryBg → controlOutline → the
 * button keycap shadow, focus rings, hover tints) by expanding colorPrimary
 * through its palette algorithm. Low-luminance primaries trip a degenerate
 * expansion — measured colorPrimaryBg / controlOutline per palette:
 *   slate #4361ee  → #f0f5ff / alpha 0.06  (fine)
 *   paper #0f766e  → #a8b5b2 / alpha 0.33  (muddy gray-teal, harsh shadow)
 *   ink   #1c1917  → #5c5956 / alpha 0.66  (mid gray, near-black shadow)
 * Fix: pin colorPrimaryBg/Hover to a direct mix of primary over bgContainer
 * (8%/13% light, 12%/18% dark); downstream derivations then resolve back to
 * slate-level values (~0.08). Menu's selected item bg gets the same treatment
 * (antd's derived tint is too washed out to read as a selected state).
 */
function primaryDerivationFix(t: Theme): {
  token: { colorPrimaryBg: string; colorPrimaryBgHover: string };
  menu: { itemSelectedBg: string; itemSelectedColor: string };
} | null {
  const primary = hexToRgb(t.color.primary);
  const bg = hexToRgb(t.color.bgContainer);
  if (!primary || !bg) return null;
  const dark = t.mode === 'dark';
  return {
    token: {
      colorPrimaryBg: mixOver(primary, bg, dark ? 0.12 : 0.08),
      colorPrimaryBgHover: mixOver(primary, bg, dark ? 0.18 : 0.13),
    },
    menu: {
      itemSelectedBg: mixOver(primary, bg, dark ? 0.18 : 0.12),
      itemSelectedColor: t.color.primary,
    },
  };
}

/**
 * Create Ant Design ThemeConfig from Theme tokens
 */
export function createAntdConfig(t: Theme): ThemeConfig {
  const fix = primaryDerivationFix(t);
  return {
    cssVar: { key: 'app' },
    hashed: false,
    zeroRuntime: false,
    algorithm: t.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: t.color.primary,
      colorSuccess: t.color.success,
      colorWarning: t.color.warning,
      colorError: t.color.error,
      colorInfo: t.color.info,
      colorBgBase: t.color.bgContainer,
      colorBgContainer: t.color.bgContainer,
      colorBgElevated: t.color.bgElevated,
      colorBgLayout: t.color.bgBase,
      colorBgMask: t.color.bgMask,
      colorText: t.color.text,
      colorTextSecondary: t.color.textSecondary,
      colorTextTertiary: t.color.textTertiary,
      colorTextQuaternary: t.color.textQuaternary,
      // Text on solid color fills (primary buttons, selected states…).
      // textInverse doubles as this token: white in light themes, dark in
      // dark themes whose primaries are brightened — required by Ink dark,
      // where the primary surface is paper-white.
      colorTextLightSolid: t.color.textInverse,
      // Tint family pinned to a direct primary/bg mix — see primaryDerivationFix.
      ...(fix?.token ?? {}),
      colorBorder: t.color.border,
      colorBorderSecondary: t.color.borderSecondary,
      colorFill: t.color.fill,
      colorFillSecondary: t.color.fillSecondary,
      colorFillTertiary: t.color.fillTertiary,
      colorLink: t.color.link,
      colorLinkHover: t.color.linkHover,
      colorLinkActive: t.color.linkActive,
      fontFamily: t.font.family,
      fontFamilyCode: t.font.familyCode,
      fontSize: parseInt(t.font.size.base),
      fontSizeHeading1: parseInt(t.font.size['4xl']),
      fontSizeHeading2: parseInt(t.font.size['3xl']),
      fontSizeHeading3: parseInt(t.font.size['2xl']),
      lineHeight: parseFloat(t.font.lineHeight),
      lineHeightHeading1: parseFloat(t.font.lineHeightHeading),
      borderRadius: parseInt(t.radius.base),
      borderRadiusLG: parseInt(t.radius.lg),
      borderRadiusSM: parseInt(t.radius.sm),
      borderRadiusXS: parseInt(t.radius.xs),
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      motionDurationFast: t.motion.duration.fast,
      motionDurationMid: t.motion.duration.normal,
      motionDurationSlow: t.motion.duration.slow,
      motionEaseInOut: t.motion.easing.inOut,
    },
    components: {
      Tooltip: {
        colorBgSpotlight: t.color.primary,
      },
      // Selected nav item: deliberate tint + primary text (antd's derived
      // tint is too washed out to register as selected).
      ...(fix ? { Menu: fix.menu } : {}),
    },
  };
}

export const lightAntdConfig = createAntdConfig(lightTheme);
export const darkAntdConfig = createAntdConfig(darkTheme);

/**
 * Convenience: Ant Design ThemeConfig by mode + theme id.
 * Pre-generated lightAntdConfig/darkAntdConfig above are the "slate" theme.
 */
export function getAntdConfig(mode: 'light' | 'dark', themeId?: ThemeId): ThemeConfig {
  return createAntdConfig(getTheme(mode, themeId));
}

/**
 * Ant Design X dedicated tokens
 */
export function getAntdXTokens(t: Theme) {
  return {
    creationBgColor: `${t.color.primary}14`,
    creationBorderColor: `${t.color.primary}33`,
    creationHoverColor: `${t.color.primary}1f`,
    shortcutKeyTextColor: `${t.color.primary}8c`,
    bubbleBg: t.color.bgBase,
    bubbleBorder: t.color.border,
    aiBubbleBg: t.color.bgBase,
    aiBubbleBorder: t.color.border,
    userBubbleBg: t.color.primary,
    userBubbleBorder: t.color.primaryHover,
  };
}

export const lightAntdXTokens = getAntdXTokens(lightTheme);
export const darkAntdXTokens = getAntdXTokens(darkTheme);
