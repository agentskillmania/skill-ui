/**
 * Live-split race simulation: history load lands mid-run. Guards the
 * user-visible outcome (no duplicated user bubble, one assistant message
 * with completed tool block), not internal transitions.
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { SSEEvent } from '../../../src/core/types.js';

function feed(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

describe('live split simulation', () => {
  it('race: loadHistory lands mid-run — one user bubble, one assistant with completed tool block', () => {
    // 1. user sends message
    let s = feed([{ event: 'user-message', data: { content: 'hi' } }]);
    // 2. GET /messages raced while run in flight: daemon persisted [user] at run start
    const raced = fromHistory([{ role: 'user', content: 'hi', timestamp: Date.now() }]);
    s = { ...raced };
    // 3. live SSE events (real daemon sequence)
    s = [
      { event: 'step-start', data: { step: 0 } },
      {
        event: 'llm-response',
        data: {
          text: '',
          toolCalls: [{ id: 'call-1', name: 'shell', arguments: { cmd: 'ls' } }],
          tokens: {},
        },
      },
      { event: 'tool-start', data: { id: 'call-1', name: 'shell', args: { cmd: 'ls' } } },
      { event: 'tool-end', data: { callId: 'call-1', result: 'file list' } },
      { event: 'step-end', data: { step: 0, status: 'continue', tokens: {} } },
      { event: 'step-start', data: { step: 0 } },
      { event: 'token', data: { delta: 'final answer' } },
      { event: 'llm-response', data: { text: 'final answer', toolCalls: null, tokens: {} } },
      { event: 'step-end', data: { step: 0, status: 'done', tokens: {} } },
      { event: 'done', data: { status: 'success', totalSteps: 2 } },
    ].reduce(reducer, s);

    // 消息面:恰好两条,用户消息未被竞态复制
    const msgs = s.main.messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('hi');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toBe('final answer');
    // 块面:工具调用块存在且已随 done 收尾
    const toolBlock = msgs[1].blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock).toBeDefined();
    expect(toolBlock!.status).toBe('completed');
    // 终态:run 回到 idle
    expect(s.main.status).toBe('idle');
  });
});
