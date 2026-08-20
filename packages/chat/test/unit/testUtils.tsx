/**
 * Test helper: unified Provider wrapper
 */
import { fireEvent } from '@testing-library/react';
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

/**
 * Block collapse standard: finished blocks render collapsed by default.
 * Expand every collapsed block header before asserting on body content.
 */
export function expandAllCollapsed() {
  document.querySelectorAll('[aria-expanded="false"]').forEach((el) => {
    fireEvent.click(el as HTMLElement);
  });
}
