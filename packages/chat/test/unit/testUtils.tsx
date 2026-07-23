/**
 * Test helper: unified Provider wrapper
 */
import type { ReactNode } from 'react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

/** Wraps ThemeProvider */
export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

/** Wraps ThemeProvider (alias kept for backward compat with existing tests) */
export function ChatWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}
