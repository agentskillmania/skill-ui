/**
 * @fileoverview Post-done todo-list regression — the daemon's step loop emits
 * its final todo snapshot on a separate channel whose SSE merge order is not
 * guaranteed, so a non-empty `todo-list` can arrive AFTER `done`. The reducer
 * must not revive the finished run (an eternal streaming bubble): the block
 * attaches completed to the last assistant message instead.
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SessionRunState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function pushEvents(events: SSEEvent[]): SessionRunState {
  return events.reduce(reducer, createEmptySessionState());
}

const turn = [
  { event: 'user-message', data: { content: 'hi' } },
  { event: 'token', data: { delta: 'answer' } },
  {
    event: 'done',
    data: { totalSteps: 1, duration: 100, tokens: { input: 10, output: 2 }, type: 'success' },
  },
];

const items = [{ id: 1, subject: '任务A', status: 'pending' as const }];

describe('todo-list after done', () => {
  it('attaches completed to the last assistant message — no streaming revival', () => {
    const state = pushEvents([...turn, { event: 'todo-list', data: { items, timestamp: 1 } }]);
    expect(state.main.status).toBe('idle');
    const msgs = state.main.messages;
    expect(msgs).toHaveLength(2); // user + assistant, NO third message
    expect(msgs.every((m) => m.status === 'completed')).toBe(true);
    const todoBlock = msgs[1].blocks?.find((b) => b.type === 'todo');
    expect(todoBlock).toBeDefined();
    expect(todoBlock!.status).toBe('completed');
    expect(state.main.todoList?.items).toHaveLength(1);
  });

  it('mid-run todo-list keeps the live streaming-block behavior', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'todo-list', data: { items, timestamp: 1 } },
    ]);
    const msgs = state.main.messages;
    expect(msgs).toHaveLength(2);
    const todoBlock = msgs[1].blocks?.find((b) => b.type === 'todo');
    expect(todoBlock).toBeDefined();
    expect(todoBlock!.status).toBe('streaming');
  });

  it('in-place update still applies when a todo block already exists', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'todo-list', data: { items, timestamp: 1 } },
      ...turn.slice(1),
      { event: 'todo-list', data: { items: [{ id: 1, subject: '任务A', status: 'completed' }] } },
    ]);
    expect(state.main.messages).toHaveLength(2);
    const todoBlock = state.main.messages[1].blocks?.find((b) => b.type === 'todo');
    expect(todoBlock?.metadata?.items).toHaveLength(1);
  });
});
