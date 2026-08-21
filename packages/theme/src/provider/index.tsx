/**
 * Theme provider and hooks
 *
 * Three-layer injection: Emotion ThemeProvider + Ant Design XProvider + CSS data attributes.
 * data-theme carries the mode ("light" | "dark"), data-theme-name carries the theme id
 * ("slate" | "paper" | "ink").
 */
import { ThemeProvider as EmotionThemeProvider, useTheme as useEmotionTheme } from '@emotion/react';
import { useEffect, useState, useCallback, type ReactNode } from 'react';

import {
  getTheme,
  resolveThemeId,
  defaultThemeId as fallbackThemeId,
  type ThemeId,
} from '../tokens/index.js';
import type { Theme } from '../types.js';

export { GlobalStyles } from './GlobalStyles.js';

/**
 * Type-safe theme hook
 */
export function useTheme(): Theme {
  return useEmotionTheme() as Theme;
}

/**
 * Create Emotion theme object
 */
export function createEmotionTheme(mode: 'light' | 'dark', themeId?: ThemeId): Theme {
  return getTheme(mode, themeId);
}

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  setThemeId: (themeId: ThemeId) => void;
}

interface ThemeProviderProps {
  children: ReactNode | ((ctx: ThemeContextValue) => ReactNode);
  /** Initial theme mode, defaults to "light" */
  defaultMode?: 'light' | 'dark';
  /** External controlled mode */
  mode?: 'light' | 'dark';
  /** Mode change callback */
  onModeChange?: (mode: 'light' | 'dark') => void;
  /** Initial theme id, defaults to "slate" */
  defaultThemeId?: ThemeId;
  /** External controlled theme id */
  themeId?: ThemeId;
  /** Theme id change callback */
  onThemeIdChange?: (themeId: ThemeId) => void;
}

/**
 * Theme provider
 * - Inject Emotion theme
 * - Set data-theme (mode) and data-theme-name (theme id) attributes
 * - Manage light/dark mode and theme switching
 */
export function ThemeProvider({
  children,
  defaultMode = 'light',
  mode: controlledMode,
  onModeChange,
  defaultThemeId = fallbackThemeId,
  themeId: controlledThemeId,
  onThemeIdChange,
}: ThemeProviderProps) {
  const [internalMode, setInternalMode] = useState(defaultMode);
  const [internalThemeId, setInternalThemeId] = useState(defaultThemeId);
  const mode = controlledMode ?? internalMode;
  const themeId = resolveThemeId(controlledThemeId ?? internalThemeId);
  const theme = getTheme(mode, themeId);

  const setMode = useCallback(
    (newMode: 'light' | 'dark') => {
      if (!controlledMode) {
        setInternalMode(newMode);
      }
      onModeChange?.(newMode);
    },
    [controlledMode, onModeChange]
  );

  const setThemeId = useCallback(
    (newThemeId: ThemeId) => {
      if (!controlledThemeId) {
        setInternalThemeId(newThemeId);
      }
      onThemeIdChange?.(newThemeId);
    },
    [controlledThemeId, onThemeIdChange]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-theme-name', themeId);
  }, [mode, themeId]);

  return (
    <EmotionThemeProvider theme={theme}>
      {typeof children === 'function'
        ? (children as (ctx: ThemeContextValue) => ReactNode)({
            theme,
            themeId,
            mode,
            setMode,
            setThemeId,
          })
        : children}
    </EmotionThemeProvider>
  );
}

ThemeProvider.displayName = 'ThemeProvider';
