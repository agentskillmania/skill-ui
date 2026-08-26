/**
 * Theme tokens unified exports
 */
import type { Theme } from '../types.js';
import { themeRegistry, resolveThemeId, type ThemeId } from './themes/index.js';

export { breakpoints } from './shared.js';
export {
  lightTheme,
  lightColor,
  lightEventStatusColor,
  lightAgentStatusColor,
  lightSkillStatusColor,
} from './light.js';
export {
  darkTheme,
  darkColor,
  darkEventStatusColor,
  darkAgentStatusColor,
  darkSkillStatusColor,
} from './dark.js';
export {
  themeRegistry,
  themeMetas,
  resolveThemeId,
  defaultThemeId,
  type ThemeId,
  type ThemeMeta,
} from './themes/index.js';
export {
  paperLightTheme,
  paperDarkTheme,
  paperLightColor,
  paperDarkColor,
} from './themes/paper.js';
export { inkLightTheme, inkDarkTheme, inkLightColor, inkDarkColor } from './themes/ink.js';
export { tideLightTheme, tideDarkTheme, tideLightColor, tideDarkColor } from './themes/tide.js';
export {
  emberLightTheme,
  emberDarkTheme,
  emberLightColor,
  emberDarkColor,
} from './themes/ember.js';
export {
  blossomLightTheme,
  blossomDarkTheme,
  blossomLightColor,
  blossomDarkColor,
} from './themes/blossom.js';

/**
 * Get the theme object by mode and theme id.
 * The second argument defaults to the "slate" theme, so existing
 * single-argument calls keep their historical behavior.
 */
export function getTheme(mode: 'light' | 'dark', themeId: ThemeId = 'slate'): Theme {
  const entry = themeRegistry[resolveThemeId(themeId)];
  return mode === 'light' ? entry.light : entry.dark;
}
