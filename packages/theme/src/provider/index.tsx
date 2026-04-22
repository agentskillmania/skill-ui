/**
 * Theme provider and hooks
 *
 * Three-layer injection: Emotion ThemeProvider + Ant Design XProvider + CSS data-theme attribute
 */
import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider, useTheme as useEmotionTheme } from '@emotion/react';
import type { Theme } from '../types.js';
import { getTheme } from '../tokens/index.js';

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
export function createEmotionTheme(mode: 'light' | 'dark'): Theme {
  return getTheme(mode);
}

interface ThemeContextValue {
  theme: Theme;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

interface ThemeProviderProps {
  children: ReactNode | ((ctx: ThemeContextValue) => ReactNode);
  /** Initial theme mode, defaults to "light" */
  defaultMode?: 'light' | 'dark';
  /** External controlled mode */
  mode?: 'light' | 'dark';
  /** Mode change callback */
  onModeChange?: (mode: 'light' | 'dark') => void;
}

/**
 * Theme provider
 * - Inject Emotion theme
 * - Set data-theme attribute
 * - Manage light/dark mode switching
 */
export function ThemeProvider({
  children,
  defaultMode = 'light',
  mode: controlledMode,
  onModeChange,
}: ThemeProviderProps) {
  const [internalMode, setInternalMode] = useState(defaultMode);
  const mode = controlledMode ?? internalMode;
  const theme = getTheme(mode);

  const setMode = useCallback(
    (newMode: 'light' | 'dark') => {
      if (!controlledMode) {
        setInternalMode(newMode);
      }
      onModeChange?.(newMode);
    },
    [controlledMode, onModeChange]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <EmotionThemeProvider theme={theme}>
      {typeof children === 'function'
        ? (children as (ctx: ThemeContextValue) => ReactNode)({ theme, mode, setMode })
        : children}
    </EmotionThemeProvider>
  );
}

ThemeProvider.displayName = 'ThemeProvider';
