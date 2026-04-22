/**
 * @agentskillmania/skill-ui-theme unified exports
 */

// Types
export type { Theme, BlockColorItem } from './types.js';

// Business constants (not theme-dependent)
export { layout, zIndex } from './constants.js';

// Tokens
export {
  getTheme,
  breakpoints,
  lightTheme,
  lightColor,
  lightBlockColor,
  darkTheme,
  darkColor,
  darkBlockColor,
} from './tokens/index.js';

// Provider
export { ThemeProvider, useTheme, createEmotionTheme, GlobalStyles } from './provider/index.js';

// Ant Design adapter
export {
  createAntdConfig,
  lightAntdConfig,
  darkAntdConfig,
  getAntdXTokens,
  lightAntdXTokens,
  darkAntdXTokens,
} from './antd/index.js';

// Style utilities
export {
  flexColumn,
  flexRow,
  flexCenter,
  flexWrap,
  gridAutoFill,
  glassEffect,
  card,
  borderDefault,
  borderAccent,
  hoverPrimary,
  hoverBg,
  disabled,
  focusVisible,
  transition,
  spin,
  scaleActive,
  textTruncate,
  textSecondary,
  iconBox,
  scrollable,
  absoluteFill,
  media,
  container,
} from './styles/index.js';
