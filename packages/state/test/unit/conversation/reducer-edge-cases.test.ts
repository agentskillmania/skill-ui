import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SessionRunState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function pushEvents(events: SSEEvent[]): SessionRunState {
  return events.reduce(reducer, createEmptySessionState());
}

function stateWithOneEvent(event: SSEEvent): SessionRunState {
  return reducer(createEmptySessionState(), event);
}

describe('reducer — uncovered event branches', () => {
  it('handles user-message event', () => {
    const state = stateWithOneEvent({
      event: 'user-message',
      data: { content: 'hello world' },
    });
    // user-message creates a user message + a pending empty assistant message
    expect(state.main.messages).toHaveLength(2);
    expect(state.main.messages[0].role).toBe('user');
    expect(state.main.messages[0].content).toBe('hello world');
    expect(state.main.messages[1].role).toBe('assistant');
    expect(state.main.messages[1].status).toBe('streaming');
  });

  it('handles llm-request event', () => {
    const state = stateWithOneEvent({
      event: 'llm-request',
      data: {
        messages: [{ role: 'system', content: 'You are...' }],
        tools: ['file_read', 'shell'],
        skill: null,
        model: 'claude-sonnet-4-5',
        contextWindow: 200000,
      },
    });
    expect(state.main.lastLLMRequest).toBeDefined();
    expect(state.main.lastLLMRequest?.tools).toEqual(['file_read', 'shell']);
    expect(state.main.lastLLMRequest?.skill).toBeNull();
    expect(state.main.lastLLMRequest?.model).toBe('claude-sonnet-4-5');
    expect(state.main.lastLLMRequest?.contextWindow).toBe(200000);
  });

  it('handles llm-request with skill name', () => {
    const state = stateWithOneEvent({
      event: 'llm-request',
      data: {
        messages: [],
        tools: [],
        skill: { current: 'my-skill' },
      },
    });
    expect(state.main.lastLLMRequest?.skill).toBe('my-skill');
  });

  it('handles compressed event', () => {
    const state = stateWithOneEvent({
      event: 'compressed',
      data: { summary: 'summarized history', removedCount: 5 },
    });
    expect(state.main.compression).toEqual({ summary: 'summarized history', removedCount: 5 });
  });

  it('compressed with estimatedContextSize refreshes lastInputTokens', () => {
    // 压缩完成后上下文占用应立即回落到压缩后的估算,而不是停在压缩前
    // 的旧值直到下一次 llm-response。
    const state = pushEvents([
      {
        event: 'llm-response',
        data: { text: 'hi', tokens: { input: 90_000, output: 10 } },
      },
      {
        event: 'compressed',
        data: { summary: 's', removedCount: 3, estimatedContextSize: 12_000 },
      },
    ]);
    expect(state.main.lastInputTokens).toBe(12_000);
  });

  it('handles compressing event (no-op)', () => {
    const state = stateWithOneEvent({ event: 'compressing', data: {} });
    expect(state.main.messages).toHaveLength(0);
    expect(state.main.status).toBe('idle');
  });

  it('handles phase-change event', () => {
    const state = stateWithOneEvent({
      event: 'phase-change',
      data: { from: 'thinking', to: 'tool_call' },
    });
    // phase-change is a default-case no-op
    expect(state.main.messages).toHaveLength(0);
  });

  it('handles error event', () => {
    const state = stateWithOneEvent({
      event: 'error',
      data: { message: 'Something went wrong' },
    });
    expect(state.main.status).toBe('error');
  });

  it('handles done event without tokens', () => {
    const state = stateWithOneEvent({ event: 'done', data: {} });
    expect(state.main.status).toBe('idle');
  });

  it('handles done event with totalSteps', () => {
    const state = stateWithOneEvent({
      event: 'done',
      data: { totalSteps: 10 },
    });
    expect(state.main.totalSteps).toBe(10);
    expect(state.main.status).toBe('idle');
  });
});

describe('reducer — sub-agent edge cases', () => {
  it('handles subagent-thinking event', () => {
    // Need subagent-start first to create the sub-agent
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 'sub-1', name: 'helper', task: 'do stuff' } },
      { event: 'subagent-thinking', data: { subtaskId: 'sub-1', content: 'Let me think...' } },
    ]);
    const sub = state.subAgents.get('sub-1');
    expect(sub).toBeDefined();
    expect(sub!.messages.length).toBeGreaterThanOrEqual(1);
  });

  it('handles subagent-tool-start and subagent-tool-end', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 'sub-1', name: 'helper', task: 'do' } },
      {
        event: 'subagent-tool-start',
        data: { subtaskId: 'sub-1', action: { id: 'c1', tool: 'shell', arguments: {} } },
      },
      {
        event: 'subagent-tool-end',
        data: { subtaskId: 'sub-1', callId: 'c1', result: 'output' },
      },
    ]);
    const sub = state.subAgents.get('sub-1');
    expect(sub).toBeDefined();
  });

  it('handles subagent-token after start', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 'sub-1', name: 'helper', task: 'do' } },
      // Wire field is `delta` (both daemons emit {subtaskId, name, delta}).
      { event: 'subagent-token', data: { subtaskId: 'sub-1', delta: 'Hello' } },
      { event: 'subagent-token', data: { subtaskId: 'sub-1', delta: ' world' } },
    ]);
    const sub = state.subAgents.get('sub-1');
    expect(sub).toBeDefined();
    expect(sub!.messages).toHaveLength(1);
    expect(sub!.messages[0].content).toBe('Hello world');
  });

  it('ignores subagent events for unknown subtaskId', () => {
    const state = stateWithOneEvent({
      event: 'subagent-token',
      data: { subtaskId: 'unknown', delta: 'x' },
    });
    expect(state.subAgents.size).toBe(0);
  });

  it('handles subagent-end with various resultStatus', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 'sub-1', name: 'helper', task: 'do' } },
      {
        event: 'subagent-end',
        data: {
          subtaskId: 'sub-1',
          name: 'helper',
          status: 'error',
          error: 'failed',
        },
      },
    ]);
    const sub = state.subAgents.get('sub-1');
    expect(sub).toBeDefined();
    expect(sub!.resultStatus).toBe('error');
    expect(sub!.error).toBe('failed');
  });
});

describe('reducer — token accumulation edge cases', () => {
  it('llm-response sets lastInputTokens but leaves cumulative totals to step-end', () => {
    const state = stateWithOneEvent({
      event: 'llm-response',
      data: {
        tokens: { input: 100, output: 50, cacheRead: 10, cacheWrite: 5 },
      },
    });
    expect(state.main.lastInputTokens).toBe(100);
    expect(state.main.tokens.input).toBe(0);
  });

  it('parses snake_case cache fields (wrangler.rs wire format)', () => {
    const state = stateWithOneEvent({
      event: 'step-end',
      data: {
        step: 0,
        tokens: { input: 100, output: 50, cache_read: 10, cache_write: 5 },
      },
    });
    expect(state.main.tokens).toEqual({ input: 100, output: 50, cacheRead: 10, cacheWrite: 5 });
  });

  it('handles llm-response without tokens', () => {
    const state = stateWithOneEvent({ event: 'llm-response', data: {} });
    expect(state.main.tokens.input).toBe(0);
  });

  it('accumulates tokens from step-end', () => {
    const state = stateWithOneEvent({
      event: 'step-end',
      data: {
        step: 1,
        tokens: { input: 200, output: 100 },
      },
    });
    expect(state.main.tokens.input).toBe(200);
    expect(state.main.tokens.output).toBe(100);
  });

  it('done does not re-add tokens (step-end owns accumulation)', () => {
    const state = stateWithOneEvent({
      event: 'done',
      data: {
        tokens: { input: 300, output: 150 },
      },
    });
    expect(state.main.tokens.input).toBe(0);
    expect(state.main.tokens.output).toBe(0);
  });
});

describe('reducer — tool-end edge cases', () => {
  it('tool-end with unmatched callId is a no-op on empty state', () => {
    const state = stateWithOneEvent({
      event: 'tool-end',
      data: { callId: 'unknown-id', result: 'orphan result' },
    });
    expect(state.main.messages).toHaveLength(0);
  });

  it('tool-end falls back to the sole streaming tool_call when callId is missing', () => {
    const state = pushEvents([
      { event: 'tool-start', data: { id: 'c1', name: 'file_read', args: {} } },
      { event: 'tool-end', data: { name: 'file_read', result: 'content' } },
    ]);
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('completed');
    expect(block?.metadata?.toolResult).toBe('content');
  });
});

describe('reducer — human-input edge cases', () => {
  it('handles human-input with options', () => {
    const state = stateWithOneEvent({
      event: 'human-input',
      data: {
        questions: [{ text: 'Choose', type: 'choice', options: ['a', 'b'] }],
      },
    });
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'human_input');
    expect(block).toBeDefined();
    expect(block?.status).toBe('pending');
  });

  it('handles human-input-resolved', () => {
    const state = pushEvents([
      {
        event: 'human-input',
        data: {
          requestId: 'r1',
          questions: [{ text: 'q', type: 'text' }],
        },
      },
      {
        event: 'human-input-resolved',
        data: { requestId: 'r1', response: { answer: 'yes' } },
      },
    ]);
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'human_input');
    expect(block?.status).toBe('completed');
    expect(block?.metadata?.response).toEqual({ answer: 'yes' });
  });
});

describe('reducer — resilience', () => {
  it('handles empty data gracefully', () => {
    const state = stateWithOneEvent({ event: 'token', data: {} });
    expect(state.main.messages).toHaveLength(0);
  });

  it('handles null token delta', () => {
    const state = stateWithOneEvent({ event: 'token', data: { delta: null } });
    expect(state.main.messages).toHaveLength(0);
  });
});
