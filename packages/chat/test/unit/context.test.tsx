import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useState } from 'react';
import { ChatContext, useChatContext } from '../../src/context.js';
import { createMockContext } from './testUtils.js';
import type { ChatContextValue } from '../../src/context.js';

describe('ChatContext', () => {
  it('provides context value', () => {
    const mockCtx = createMockContext();
    const { result } = renderHook(() => useChatContext(), {
      wrapper: ({ children }) => (
        <ChatContext.Provider value={mockCtx}>{children}</ChatContext.Provider>
      ),
    });
    expect(result.current.renderers).toBeDefined();
    expect(result.current.renderers).toEqual({});
  });

  it('throws error when used outside Chat', () => {
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

  it('forwards onConfirmHumanRequest', () => {
    const fn = () => {};
    const mockCtx = createMockContext({ onConfirmHumanRequest: fn });
    const { result } = renderHook(() => useChatContext(), {
      wrapper: ({ children }) => (
        <ChatContext.Provider value={mockCtx}>{children}</ChatContext.Provider>
      ),
    });
    expect(result.current.onConfirmHumanRequest).toBe(fn);
  });

  it('forwards renderers', () => {
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

  it('hook returns new value after context update', () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const mockCtx1 = createMockContext({ onConfirmHumanRequest: fn1 });
    const mockCtx2 = createMockContext({ onConfirmHumanRequest: fn2 });

    let ctxValue: ChatContextValue = mockCtx1;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChatContext.Provider value={ctxValue}>{children}</ChatContext.Provider>
    );

    const { result, rerender } = renderHook(() => useChatContext(), { wrapper });
    expect(result.current.onConfirmHumanRequest).toBe(fn1);

    // trigger re-render after updating external variable
    ctxValue = mockCtx2;
    rerender(undefined);

    expect(result.current.onConfirmHumanRequest).toBe(fn2);
  });
});
