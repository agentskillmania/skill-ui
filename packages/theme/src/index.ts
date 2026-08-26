/**
 * @agentskillmania/skill-ui-theme unified exports
 */

// Types
export type { Theme, EventStatusColorItem, AgentStatusColorItem } from './types.js';

// Business constants (not theme-dependent)
export { layout, zIndex } from './constants.js';

// Tokens
export {
  getTheme,
  breakpoints,
  lightTheme,
  lightColor,
  lightEventStatusColor,
  lightAgentStatusColor,
  lightSkillStatusColor,
  darkTheme,
  darkColor,
  darkEventStatusColor,
  darkAgentStatusColor,
  darkSkillStatusColor,
  themeRegistry,
  themeMetas,
  resolveThemeId,
  defaultThemeId,
  type ThemeId,
  type ThemeMeta,
} from './tokens/index.js';

// Provider
export { ThemeProvider, useTheme, createEmotionTheme, GlobalStyles } from './provider/index.js';

// Ant Design adapter
export {
  createAntdConfig,
  getAntdConfig,
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
  spinKeyframes,
  scaleActive,
  textTruncate,
  textSecondary,
  iconBox,
  scrollable,
  absoluteFill,
  interactiveItem,
  subtleBackground,
  interactiveRow,
  borderSeparator,
  scrollContainer,
  media,
  container,
} from './styles/index.js';
