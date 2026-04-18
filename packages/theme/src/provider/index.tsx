/**
 * 主题 Provider 与 hooks
 *
 * 三层注入：Emotion ThemeProvider + Ant Design XProvider + CSS data-theme 属性
 */
import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider, useTheme as useEmotionTheme } from '@emotion/react';
import type { Theme } from '../types.js';
import { getTheme } from '../tokens/index.js';

export { GlobalStyles } from './GlobalStyles.js';

/**
 * 类型安全的主题 hook
 */
export function useTheme(): Theme {
  return useEmotionTheme() as Theme;
}

/**
 * 创建 Emotion 主题对象
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
  /** 初始主题模式，默认 "light" */
  defaultMode?: 'light' | 'dark';
  /** 外部受控模式 */
  mode?: 'light' | 'dark';
  /** 模式变更回调 */
  onModeChange?: (mode: 'light' | 'dark') => void;
}

/**
 * 主题 Provider
 * - 注入 Emotion 主题
 * - 设置 data-theme 属性
 * - 管理亮/暗模式切换
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
