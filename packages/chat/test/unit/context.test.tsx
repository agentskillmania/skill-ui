import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ChatContext, useChatContext } from '../../src/context.js';
import { createMockContext } from './testUtils.js';
import type { ChatContextValue } from '../../src/context.js';

describe('ChatContext', () => {
  it('提供上下文值', () => {
    const mockCtx = createMockContext();
    const { result } = renderHook(() => useChatContext(), {
      wrapper: ({ children }) => (
        <ChatContext.Provider value={mockCtx}>{children}</ChatContext.Provider>
      ),
    });
    expect(result.current.theme).toBeDefined();
    expect(result.current.renderers).toEqual({});
  });

  it('在 Chat 外部使用时抛出错误', () => {
    const { result } = renderHook(() => {
      try {
        useChatContext();
      } catch (e) {
        return e;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toContain('useChatContext');
  });

  it('透传 onConfirmHumanRequest', () => {
    const fn = () => {};
    const mockCtx = createMockContext({ onConfirmHumanRequest: fn });
    const { result } = renderHook(() => useChatContext(), {
      wrapper: ({ children }) => (
        <ChatContext.Provider value={mockCtx}>{children}</ChatContext.Provider>
      ),
    });
    expect(result.current.onConfirmHumanRequest).toBe(fn);
  });

  it('透传 renderers', () => {
    const MyRenderer = () => null;
    const mockCtx = createMockContext({
      renderers: { messages: { custom: MyRenderer } },
    });
    const { result } = renderHook(() => useChatContext(), {
      wrapper: ({ children }) => (
        <ChatContext.Provider value={mockCtx}>{children}</ChatContext.Provider>
      ),
    });
    expect(result.current.renderers.messages?.custom).toBe(MyRenderer);
  });
});
