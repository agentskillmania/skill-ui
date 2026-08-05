import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { SSEEvent } from '../../../src/core/types.js';

function feed(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

describe('live split simulation', () => {
  it('race: loadHistory lands mid-run', () => {
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
    const msgs = s.main.messages;
    console.log(
      'MESSAGES:',
      JSON.stringify(
        msgs.map((m) => ({
          role: m.role,
          content: m.content,
          blocks: m.blocks?.map((b) => b.type),
        })),
        null,
        1
      )
    );
    expect(msgs.length).toBe(2); // user + ONE assistant bubble
  });
});
