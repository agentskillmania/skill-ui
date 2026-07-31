/**
 * @fileoverview useDiagnosticsState hook tests — React rendering lifecycle
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiagnosticsState } from '../../../src/hooks/useDiagnosticsState.js';
import { createEmptyDiagnosticsState } from '../../../src/core/diagnostics/types.js';

describe('useDiagnosticsState', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useDiagnosticsState());
    expect(result.current.state.runner).toBeNull();
  });

  it('feed.push updates state via reducer', () => {
    const { result } = renderHook(() => useDiagnosticsState());

    act(() => {
      result.current.feed.push({
        event: 'agent-diagnostics',
        data: {
          runner: { features: null, tools: [], skills: [] },
          agent: null,
          llm: null,
          systemPrompt: null,
          session: {
            overview: {
              agentName: 'x',
              model: 'm',
              stepCount: 0,
              messageCount: 0,
              status: 'idle',
              createdAt: '',
              updatedAt: '',
            },
            info: { sessionId: 's1', agentName: 'x', model: 'm', workspacePath: '/' },
          },
        },
      });
    });

    expect(result.current.state.session.info?.sessionId).toBe('s1');
  });

  it('reset returns to empty state', () => {
    const { result } = renderHook(() => useDiagnosticsState());

    act(() => {
      result.current.feed.push({
        event: 'agent-diagnostics',
        data: {
          runner: { features: null, tools: [], skills: [] },
          agent: null,
          llm: null,
          session: {},
        },
      });
    });
    expect(result.current.state.runner).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.runner).toBeNull();
  });

  it('feed and reset are stable references', () => {
    const { result, rerender } = renderHook(() => useDiagnosticsState());
    const feed1 = result.current.feed;
    const reset1 = result.current.reset;
    rerender();
    expect(result.current.feed).toBe(feed1);
    expect(result.current.reset).toBe(reset1);
  });
});
