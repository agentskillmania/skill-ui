/**
 * @fileoverview useConversationState hook tests — React rendering lifecycle
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConversationState } from '../../../src/hooks/useConversationState.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { ColtsMessageInput, SSEEvent } from '../../../src/core/types.js';

describe('useConversationState', () => {
  it('returns empty initial state', () => {
    const { result } = renderHook(() => useConversationState());
    expect(result.current.state.main.messages).toHaveLength(0);
    expect(result.current.state.subAgents.size).toBe(0);
    expect(result.current.state.events).toHaveLength(0);
    expect(result.current.state.main.status).toBe('idle');
    expect(typeof result.current.feed.push).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.loadHistory).toBe('function');
  });

  it('feed.push updates state (token accumulation)', () => {
    const { result } = renderHook(() => useConversationState());
    act(() => {
      result.current.feed.push({ event: 'token', data: { delta: 'Hello' } });
    });
    expect(result.current.state.main.messages).toHaveLength(1);
    expect(result.current.state.main.messages[0].content).toBe('Hello');
    expect(result.current.state.main.messages[0].status).toBe('streaming');
  });

  it('multiple pushes accumulate state (token + thinking + done)', () => {
    const { result } = renderHook(() => useConversationState());
    act(() => {
      result.current.feed.push({ event: 'thinking', data: { content: 'Let me think...' } });
      result.current.feed.push({ event: 'token', data: { delta: 'Answer' } });
      result.current.feed.push({ event: 'done', data: { totalSteps: 1, duration: 500 } });
    });
    expect(result.current.state.main.status).toBe('idle');
    expect(result.current.state.main.totalSteps).toBe(1);
    expect(result.current.state.main.duration).toBe(500);
    // thinking block should be completed after done
    const msg = result.current.state.main.messages[0];
    const thinkingBlock = msg.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock?.status).toBe('completed');
    expect(msg.content).toBe('Answer');
  });

  it('reset clears state back to empty', () => {
    const { result } = renderHook(() => useConversationState());
    act(() => {
      result.current.feed.push({ event: 'token', data: { delta: 'data' } });
      result.current.feed.push({ event: 'thinking', data: { content: 'hmm' } });
    });
    expect(result.current.state.main.messages).toHaveLength(1);
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.main.messages).toHaveLength(0);
    expect(result.current.state.events).toHaveLength(0);
    expect(result.current.state.main.status).toBe('idle');
  });

  it('loadHistory injects pre-built state', () => {
    const { result } = renderHook(() => useConversationState());
    const history: ColtsMessageInput[] = [
      { role: 'user', content: 'Hi', timestamp: 1000 },
      { role: 'assistant', content: 'Hello!', type: 'action', timestamp: 2000 },
    ];
    const loaded = fromHistory(history);
    act(() => {
      result.current.loadHistory(loaded);
    });
    expect(result.current.state.main.messages).toHaveLength(2);
    expect(result.current.state.main.messages[0].role).toBe('user');
    expect(result.current.state.main.messages[0].content).toBe('Hi');
    expect(result.current.state.main.messages[1].content).toBe('Hello!');
  });

  it('feed reference is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useConversationState());
    const feed1 = result.current.feed;
    rerender();
    const feed2 = result.current.feed;
    expect(feed1).toBe(feed2);
  });

  it('reset and loadHistory references are stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useConversationState());
    const reset1 = result.current.reset;
    const loadHistory1 = result.current.loadHistory;
    rerender();
    expect(result.current.reset).toBe(reset1);
    expect(result.current.loadHistory).toBe(loadHistory1);
  });
});
