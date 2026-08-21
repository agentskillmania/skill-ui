/**
 * Theme registry — every theme ships a light and a dark variant.
 *
 * "slate" is the default theme and stays byte-identical to the historical
 * lightTheme/darkTheme exports, so existing consumers are unaffected.
 */
import type { Theme } from '../../types.js';
import { lightTheme } from '../light.js';
import { darkTheme } from '../dark.js';
import { paperLightTheme, paperDarkTheme } from './paper.js';
import { inkLightTheme, inkDarkTheme } from './ink.js';

export type ThemeId = 'slate' | 'paper' | 'ink';

export interface ThemeMeta {
  id: ThemeId;
  /** English display name */
  name: string;
  /** Chinese display name */
  nameZh: string;
  /** One-line description of the visual character */
  description: string;
  descriptionZh: string;
  /** Representative light-mode colors, for rendering theme pickers */
  swatch: {
    primary: string;
    bgBase: string;
    bgContainer: string;
    text: string;
  };
}

interface ThemeEntry {
  meta: ThemeMeta;
  light: Theme;
  dark: Theme;
}

export const themeRegistry: Record<ThemeId, ThemeEntry> = {
  slate: {
    meta: {
      id: 'slate',
      name: 'Slate',
      nameZh: '岩蓝',
      description: 'Cool slate neutrals with an indigo brand color — the default.',
      descriptionZh: '冷调岩灰中性色 + 靛蓝品牌色，默认主题。',
      swatch: {
        primary: lightTheme.color.primary,
        bgBase: lightTheme.color.bgBase,
        bgContainer: lightTheme.color.bgContainer,
        text: lightTheme.color.text,
      },
    },
    light: lightTheme,
    dark: darkTheme,
  },
  paper: {
    meta: {
      id: 'paper',
      name: 'Paper',
      nameZh: '暖纸',
      description: 'Warm paper neutrals with a muted teal — calm, low-chroma, easy on the eyes.',
      descriptionZh: '暖纸中性色 + 墨绿主色，低饱和、耐看，适合长时间读写。',
      swatch: {
        primary: paperLightTheme.color.primary,
        bgBase: paperLightTheme.color.bgBase,
        bgContainer: paperLightTheme.color.bgContainer,
        text: paperLightTheme.color.text,
      },
    },
    light: paperLightTheme,
    dark: paperDarkTheme,
  },
  ink: {
    meta: {
      id: 'ink',
      name: 'Ink',
      nameZh: '墨',
      description: 'Rice-paper white, ink-black primary, a single vermilion accent.',
      descriptionZh: '宣纸底 + 墨黑主色 + 朱砂点缀；深色反转为墨底白宣。',
      swatch: {
        primary: inkLightTheme.color.primary,
        bgBase: inkLightTheme.color.bgBase,
        bgContainer: inkLightTheme.color.bgContainer,
        text: inkLightTheme.color.text,
      },
    },
    light: inkLightTheme,
    dark: inkDarkTheme,
  },
};

/** All themes in display order — use this to build theme pickers. */
export const themeMetas: ThemeMeta[] = [
  themeRegistry.slate.meta,
  themeRegistry.paper.meta,
  themeRegistry.ink.meta,
];

export const defaultThemeId: ThemeId = 'slate';

/** Normalize an arbitrary persisted value to a known theme id. */
export function resolveThemeId(value?: string | null): ThemeId {
  return value != null && value in themeRegistry ? (value as ThemeId) : defaultThemeId;
}
