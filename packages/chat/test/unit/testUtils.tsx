/**
 * 测试辅助：统一的 Provider wrapper
 */
import type { ReactNode } from 'react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { Theme } from '@agentskillmania/skill-ui-theme';
import { ChatContext } from '../../src/context.js';
import type { ChatContextValue } from '../../src/context.js';

/** 默认 Chat 上下文值 */
export function createMockContext(overrides?: Partial<ChatContextValue>): ChatContextValue {
  return {
    theme: lightTheme,
    renderers: {},
    onConfirmHumanRequest: undefined,
    messageDecorator: undefined,
    ...overrides,
  };
}

/** 包裹 ThemeProvider */
export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

/** 包裹 ThemeProvider + ChatContext */
export function ChatWrapper({
  children,
  context,
}: {
  children: ReactNode;
  context?: Partial<ChatContextValue>;
}) {
  const ctx = createMockContext(context);
  return (
    <ThemeProvider theme={lightTheme}>
      <ChatContext.Provider value={ctx}>{children}</ChatContext.Provider>
    </ThemeProvider>
  );
}
