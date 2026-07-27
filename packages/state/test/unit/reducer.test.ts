/**
 * @fileoverview Reducer unit tests — SSE event → SessionRunState
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../src/reducer.js';
import { createEmptySessionState } from '../../src/types.js';
import type { SSEEvent, SessionRunState } from '../../src/types.js';

function pushEvents(events: SSEEvent[]): SessionRunState {
  return events.reduce(reducer, createEmptySessionState());
}

describe('reducer — main agent events', () => {
  it('accumulates token deltas into assistant message content', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'Hello' } },
      { event: 'token', data: { delta: ' world' } },
    ]);
    const lastMsg = state.main.messages[state.main.messages.length - 1];
    expect(lastMsg.role).toBe('assistant');
    expect(lastMsg.content).toBe('Hello world');
    expect(lastMsg.status).toBe('streaming');
  });

  it('creates thinking block from thinking events', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: 'Let me think...' } },
      { event: 'thinking', data: { content: ' about this.' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const thinkingBlock = msg.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock).toBeDefined();
    expect(thinkingBlock!.content).toBe('Let me think... about this.');
    expect(thinkingBlock!.status).toBe('streaming');
  });

  it('closes thinking block when token arrives', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: 'Hmm' } },
      { event: 'token', data: { delta: 'Answer' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const thinkingBlock = msg.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock!.status).toBe('completed');
    expect(msg.content).toBe('Answer');
  });

  it('creates and completes tool_call block (matched by callId)', () => {
    const state = pushEvents([
      { event: 'tool-start', data: { id: 'call-1', name: 'file_read', args: { path: '/test' } } },
      { event: 'tool-end', data: { callId: 'call-1', result: 'file content' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const toolBlock = msg.blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock).toBeDefined();
    expect(toolBlock!.status).toBe('completed');
    expect(toolBlock!.metadata?.toolName).toBe('file_read');
    expect(toolBlock!.metadata?.toolResult).toBe('file content');
  });

  it('manages skill lifecycle: loading → loaded → start → end', () => {
    const state = pushEvents([
      { event: 'skill-loading', data: { name: 'poet' } },
      { event: 'skill-loaded', data: { name: 'poet', tokenCount: 500 } },
      { event: 'skill-start', data: { name: 'poet', task: 'write a haiku' } },
      { event: 'skill-end', data: { name: 'poet', result: '樱花飘落\n春风中\n寂静' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const skillBlock = msg.blocks?.find((b) => b.type === 'skill');
    expect(skillBlock).toBeDefined();
    expect(skillBlock!.status).toBe('completed');
    expect(skillBlock!.metadata?.phase).toBe('completed');
    expect(state.main.activeSkill).toBeNull();
  });

  it('creates human_input block and resolves it', () => {
    const state = pushEvents([
      {
        event: 'human-input',
        data: {
          requestId: 'req-1',
          context: '需要确认',
          questions: [{ id: 'q1', question: '继续吗？', type: 'input' }],
        },
      },
      { event: 'human-input-resolved', data: { requestId: 'req-1', response: 'yes' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const humanBlock = msg.blocks?.find((b) => b.type === 'human_input');
    expect(humanBlock).toBeDefined();
    expect(humanBlock!.status).toBe('completed');
    expect(humanBlock!.metadata?.response).toBe('yes');
  });

  it('accumulates tokens from llm-response events', () => {
    const state = pushEvents([
      { event: 'llm-response', data: { text: 'hi', tokens: { input: 100, output: 50, cacheRead: 10, cacheWrite: 5 } } },
      { event: 'llm-response', data: { text: 'bye', tokens: { input: 200, output: 30, cacheRead: 0, cacheWrite: 0 } } },
    ]);
    expect(state.main.tokens).toEqual({ input: 300, output: 80, cacheRead: 10, cacheWrite: 5 });
  });

  it('records step count and duration from step events', () => {
    const state = pushEvents([
      { event: 'step-start', data: { step: 0 } },
      { event: 'step-end', data: { step: 0, tokens: { input: 10, output: 5, cacheRead: 0, cacheWrite: 0 }, duration: 1500 } },
      { event: 'step-start', data: { step: 1 } },
      { event: 'step-end', data: { step: 1, tokens: { input: 20, output: 10, cacheRead: 0, cacheWrite: 0 }, duration: 2000 } },
    ]);
    expect(state.main.stepCount).toBe(1);
    expect(state.main.tokens.input).toBe(30);
    expect(state.main.duration).toBe(3500);
  });

  it('marks all blocks completed on done event', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: 'thinking...' } },
      { event: 'tool-start', data: { id: 't1', name: 'test', args: {} } },
      { event: 'done', data: { totalSteps: 3, duration: 5000 } },
    ]);
    expect(state.main.status).toBe('idle');
    expect(state.main.totalSteps).toBe(3);
    expect(state.main.duration).toBe(5000);
    for (const msg of state.main.messages) {
      for (const block of msg.blocks ?? []) {
        expect(block.status).toBe('completed');
      }
    }
  });

  it('appends every event to the event log', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'A' } },
      { event: 'thinking', data: { content: 'B' } },
      { event: 'done', data: {} },
    ]);
    expect(state.events).toHaveLength(3);
    expect(state.events[0].type).toBe('token');
    expect(state.events[1].type).toBe('thinking');
    expect(state.events[2].type).toBe('done');
  });
});

describe('reducer — sub-agent events', () => {
  it('creates sub-agent on subagent-start and block on parent message', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'Let me delegate.' } },
      { event: 'subagent-start', data: { name: 'researcher', task: 'find papers', subtaskId: 'sa-1' } },
    ]);
    // Sub-agent created
    expect(state.subAgents.size).toBe(1);
    const sub = state.subAgents.get('sa-1');
    expect(sub).toBeDefined();
    expect(sub!.name).toBe('researcher');
    expect(sub!.task).toBe('find papers');
    expect(sub!.status).toBe('streaming');

    // Parent block created
    const msg = state.main.messages[state.main.messages.length - 1];
    const subBlock = msg.blocks?.find((b) => b.type === 'subagent');
    expect(subBlock).toBeDefined();
    expect(subBlock!.metadata?.subtaskId).toBe('sa-1');
    expect(subBlock!.metadata?.name).toBe('researcher');
  });

  it('accumulates sub-agent tokens into sub-agent messages', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { name: 'writer', task: 'write', subtaskId: 'sa-2' } },
      { event: 'subagent-token', data: { subtaskId: 'sa-2', delta: 'Once upon' } },
      { event: 'subagent-token', data: { subtaskId: 'sa-2', delta: ' a time.' } },
    ]);
    const sub = state.subAgents.get('sa-2');
    expect(sub).toBeDefined();
    const lastMsg = sub!.messages[sub!.messages.length - 1];
    expect(lastMsg.role).toBe('assistant');
    expect(lastMsg.content).toBe('Once upon a time.');
  });

  it('completes sub-agent on subagent-end with metrics', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { name: 'researcher', task: 'search', subtaskId: 'sa-3' } },
      { event: 'subagent-token', data: { subtaskId: 'sa-3', delta: 'result' } },
      {
        event: 'subagent-end',
        data: {
          subtaskId: 'sa-3',
          status: 'success',
          totalSteps: 3,
          tokens: { input: 500, output: 200, cacheRead: 50, cacheWrite: 0 },
          duration: 10000,
        },
      },
    ]);
    const sub = state.subAgents.get('sa-3');
    expect(sub!.status).toBe('idle');
    expect(sub!.resultStatus).toBe('success');
    expect(sub!.totalSteps).toBe(3);
    expect(sub!.tokens).toEqual({ input: 500, output: 200, cacheRead: 50, cacheWrite: 0 });
    expect(sub!.duration).toBe(10000);

    // Parent block also updated
    const msg = state.main.messages[0];
    const subBlock = msg.blocks?.find((b) => b.type === 'subagent');
    expect(subBlock!.status).toBe('completed');
    expect(subBlock!.metadata?.resultStatus).toBe('success');
    expect(subBlock!.metadata?.steps).toBe(3);
  });
});

describe('reducer — negative paths', () => {
  it('handles unknown event types without crashing', () => {
    const state = pushEvents([
      { event: 'unknown-event', data: { foo: 'bar' } },
    ]);
    // Unknown events should be appended to event log but not modify state
    expect(state.events).toHaveLength(1);
    expect(state.events[0].type).toBe('unknown-event');
    expect(state.main.messages).toHaveLength(0);
  });

  it('handles events with empty data', () => {
    const state = pushEvents([
      { event: 'token', data: {} },
      { event: 'done', data: {} },
    ]);
    // Empty token delta → empty content but no crash
    expect(state.main.status).toBe('idle');
    const lastMsg = state.main.messages[state.main.messages.length - 1];
    expect(lastMsg.content).toBe('');
  });

  it('handles llm-response with undefined tokens', () => {
    const state = pushEvents([
      { event: 'llm-response', data: { text: 'hi' } }, // no tokens field
    ]);
    // Tokens should remain at zero, not crash
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it('handles subagent-token for unknown subtaskId', () => {
    const state = pushEvents([
      { event: 'subagent-token', data: { subtaskId: 'nonexistent', delta: 'hello' } },
    ]);
    // Should not crash, sub-agent not created
    expect(state.subAgents.size).toBe(0);
  });

  it('handles tool-end with no matching callId', () => {
    const state = pushEvents([
      { event: 'tool-end', data: { callId: 'nonexistent', result: 'data' } },
    ]);
    // Should not crash — no tool block to update
    expect(state.main.messages).toHaveLength(0);
  });
});
