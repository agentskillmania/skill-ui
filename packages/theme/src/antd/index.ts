/**
 * Ant Design / Ant Design X theme config mapping
 */
import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { Theme } from '../types.js';
import { lightTheme, darkTheme } from '../tokens/index.js';

/**
 * Create Ant Design ThemeConfig from Theme tokens
 */
export function createAntdConfig(t: Theme): ThemeConfig {
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
    },
  };
}

export const lightAntdConfig = createAntdConfig(lightTheme);
export const darkAntdConfig = createAntdConfig(darkTheme);

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
