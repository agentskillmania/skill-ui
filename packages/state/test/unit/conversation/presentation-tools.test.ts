/**
 * 自带表现块的工具(PRESENTED_TOOLS:ask_human / todolist_write)在两条
 * 渲染路径上都不再产出 tool_call 块 —— 信息由问答卡/todo 卡承载,
 * 双份是噪音且造成 live 与 resume 的渲染漂移(实测:live 两个块、
 * history 只剩其一,两个工具方向相反)。见 blocks.ts。
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';
import type { ColtsMessageInput } from '../../../src/core/types.js';

function s(event: string, data: Record<string, unknown>): SSEEvent {
  return { event, data };
}

function run(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

describe('live: presented tools create no tool_call block', () => {
  it('ask_human tool-start is silent; the question card is the only block', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('token', { delta: 'let me ask' }),
      s('tool-start', { id: 'call-1', name: 'ask_human', args: { questions: [] } }),
      s('human-input', {
        requestId: 'call-1',
        questions: [{ id: 'q', question: '?', type: 'text' }],
      }),
      s('done', { type: 'waiting_human' }),
    ]);
    const last = state.main.messages[state.main.messages.length - 1];
    expect(last.blocks?.map((b) => b.type)).toEqual(['text', 'human_input']);
    expect(last.blocks?.find((b) => b.type === 'human_input')?.status).toBe('pending');
  });

  it('ask_human tool-start still closes open thinking prose', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('thinking', { content: 'hmm' }),
      s('tool-start', { id: 'call-1', name: 'ask_human', args: {} }),
      s('human-input', {
        requestId: 'call-1',
        questions: [{ id: 'q', question: '?', type: 'text' }],
      }),
    ]);
    const last = state.main.messages[state.main.messages.length - 1];
    expect(last.blocks?.find((b) => b.type === 'thinking')?.status).toBe('completed');
    expect(last.blocks?.some((b) => b.type === 'tool_call')).toBe(false);
  });

  it('todolist_write tool-start is silent; the todo card comes via todo-list', () => {
    const state = run([
      s('user-message', { content: 'plan it' }),
      s('tool-start', { id: 'call-2', name: 'todolist_write', args: {} }),
      s('todo-list', { items: [{ id: 1, subject: 'step', status: 'pending' }] }),
      s('tool-end', { callId: 'call-2', result: 'updated' }),
      s('done', { type: 'success' }),
    ]);
    const blocks = state.main.messages.flatMap((m) => m.blocks ?? []);
    expect(blocks.some((b) => b.type === 'tool_call')).toBe(false);
    expect(blocks.some((b) => b.type === 'todo')).toBe(true);
  });
});

describe('history: presented tools create no tool_call block', () => {
  it('todolist_write rows render no tool block; todo card comes from the snapshot', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'plan it', timestamp: 1 },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call-2', name: 'todolist_write', arguments: {} }],
        timestamp: 2,
      },
      { role: 'tool', toolCallId: 'call-2', content: 'updated', timestamp: 3 },
      { role: 'assistant', content: 'done', timestamp: 4 },
    ];
    const state = fromHistory(messages, {
      todoList: { items: [{ id: 1, subject: 'step', status: 'pending' }] } as never,
    });
    const blocks = state.main.messages.flatMap((m) => m.blocks ?? []);
    expect(blocks.some((b) => b.type === 'tool_call')).toBe(false);
    expect(blocks.some((b) => b.type === 'todo')).toBe(true);
  });

  it('answered ask_human still renders only the human_input block (parity)', () => {
    const messages: ColtsMessageInput[] = [
      { role: 'user', content: 'hi', timestamp: 1 },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call-1', name: 'ask_human', arguments: { questions: [] } }],
        timestamp: 2,
      },
      { role: 'tool', toolCallId: 'call-1', content: '{"q":"a"}', timestamp: 3 },
      { role: 'assistant', content: 'thanks', timestamp: 4 },
    ];
    const state = fromHistory(messages);
    const blocks = state.main.messages.flatMap((m) => m.blocks ?? []);
    expect(blocks.some((b) => b.type === 'tool_call')).toBe(false);
    expect(blocks.filter((b) => b.type === 'human_input')).toHaveLength(1);
  });
});
