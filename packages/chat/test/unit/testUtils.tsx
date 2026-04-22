/**
 * Test helper: unified Provider wrapper
 */
import type { ReactNode } from 'react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { ChatContext } from '../../src/context.js';
import type { ChatContextValue } from '../../src/context.js';

/** Default Chat context value */
export function createMockContext(overrides?: Partial<ChatContextValue>): ChatContextValue {
  return {
    renderers: {},
    onConfirmHumanRequest: undefined,
    messageDecorator: undefined,
    ...overrides,
  };
}

/** Wraps ThemeProvider */
export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

/** Wraps ThemeProvider + ChatContext */
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
