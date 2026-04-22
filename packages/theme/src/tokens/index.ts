/**
 * Theme tokens unified exports
 */
import type { Theme } from '../types.js';
import { lightTheme } from './light.js';
import { darkTheme } from './dark.js';

export { breakpoints } from './shared.js';
export { lightTheme, lightColor, lightBlockColor } from './light.js';
export { darkTheme, darkColor, darkBlockColor } from './dark.js';

/** Get the corresponding theme by mode */
export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}
