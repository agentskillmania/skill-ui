/**
 * Theme tokens unified exports
 */
import type { Theme } from '../types.js';
import { darkTheme } from './dark.js';
import { lightTheme } from './light.js';

export { breakpoints } from './shared.js';
export {
  lightTheme,
  lightColor,
  lightBlockColor,
  lightEventStatusColor,
  lightAgentStatusColor,
  lightSkillStatusColor,
} from './light.js';
export {
  darkTheme,
  darkColor,
  darkBlockColor,
  darkEventStatusColor,
  darkAgentStatusColor,
  darkSkillStatusColor,
} from './dark.js';

/** Get the corresponding theme by mode */
export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}
