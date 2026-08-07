/**
 * Test utilities: unified Provider wrapper
 */
import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { ThemeProvider, lightAntdConfig } from '@agentskillmania/skill-ui-theme';

/**
 * Wrap with antd ConfigProvider + skill-ui-theme ThemeProvider.
 *
 * Uses skill-ui-theme's own ThemeProvider (NOT @emotion/react's directly):
 * components in sibling packages (chat etc.) resolve their `useTheme` through
 * skill-ui-theme's emotion import, and pnpm may install more than one
 * @emotion/react copy — an emotion ThemeProvider from the editor's copy would
 * leave those components with an empty context (theme undefined).
 */
export function EditorWrapper({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider defaultMode="light">{children}</ThemeProvider>
    </ConfigProvider>
  );
}

/** render + Provider wrapper */
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: EditorWrapper });
}
