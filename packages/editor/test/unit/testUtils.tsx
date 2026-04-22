/**
 * Test utilities: unified Provider wrapper
 */
import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';

/** Wrap with antd ConfigProvider + Emotion ThemeProvider */
export function EditorWrapper({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

/** render + Provider wrapper */
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: EditorWrapper });
}
