/**
 * @agentskillmania/skill-ui-theme 统一导出
 */

// 类型
export type { Theme, BlockColorItem } from './types.js';

// 业务常量（不随主题变化）
export { layout, zIndex } from './constants.js';

// Token
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

// Ant Design 适配
export {
  createAntdConfig,
  lightAntdConfig,
  darkAntdConfig,
  getAntdXTokens,
  lightAntdXTokens,
  darkAntdXTokens,
} from './antd/index.js';

// 样式工具
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
