/**
 * 主题 token 统一导出
 */
import type { Theme } from '../types.js';
import { lightTheme } from './light.js';
import { darkTheme } from './dark.js';

export { breakpoints } from './shared.js';
export { lightTheme, lightColor, lightBlockColor } from './light.js';
export { darkTheme, darkColor, darkBlockColor } from './dark.js';

/** 根据模式获取对应主题 */
export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}
