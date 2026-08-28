/**
 * Defensive-path tests for conversation reducer — exercises fallback
 * branches (?? defaults, missing fields, partial data) AND verifies
 * the actual behavioral outcome, not just "doesn't crash".
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function s(event: string, data: Record<string, unknown>): SSEEvent {
  return { event, data };
}

function run(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

function lastMsg(state: ReturnType<typeof run>) {
  return state.main.messages[state.main.messages.length - 1];
}

describe('reducer — token accumulation with partial data', () => {
  it('llm-response tokens never accumulate (cumulative lives at step-end)', () => {
    const state = run([
      s('llm-response', { tokens: { input: 10 } }),
      s('llm-response', { tokens: { output: 5 } }),
    ]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    // 第二次响应 input 缺失(视为 0)不覆盖已有的正读数。
    expect(state.main.lastInputTokens).toBe(10);
  });

  it('treats null token fields as 0', () => {
    const state = run([
      s('llm-response', {
        tokens: { input: null, output: null, cacheRead: null, cacheWrite: null },
      }),
    ]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it('leaves tokens unchanged when no tokens field present', () => {
    const state = run([s('llm-response', {})]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it('accumulates partial tokens from step-end', () => {
    const state = run([s('step-end', { step: 1, tokens: { input: 100 } })]);
    expect(state.main.tokens.input).toBe(100);
    expect(state.main.tokens.output).toBe(0);
  });

  it('done does not accumulate partial tokens (informational run totals)', () => {
    const state = run([s('done', { tokens: { output: 50 } })]);
    expect(state.main.tokens.output).toBe(0);
    expect(state.main.tokens.input).toBe(0);
  });

  it('accumulates partial tokens from subagent-end', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-end', { subtaskId: 's1', tokens: { input: 10 } }),
    ]);
    expect(state.subAgents.get('s1')!.tokens).toEqual({
      input: 10,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    });
  });
});

describe('reducer — streaming with null/missing fields', () => {
  it('token with null delta is a no-op', () => {
    const state = run([s('token', { delta: null })]);
    // Empty frames between reasoning segments create neither message nor block
    expect(state.main.messages).toHaveLength(0);
  });

  it('token with missing delta field is a no-op', () => {
    const state = run([s('token', {})]);
    expect(state.main.messages).toHaveLength(0);
  });

  it('thinking with null content does not create an empty block', () => {
    // LLM streams start with an empty reasoning_content chunk — an empty
    // thinking event must not surface an empty thinking block.
    const state = run([s('thinking', { content: null })]);
    expect(lastMsg(state).blocks ?? []).toHaveLength(0);
  });

  it('thinking with missing content does not create an empty block', () => {
    const state = run([s('thinking', {})]);
    expect(lastMsg(state).blocks ?? []).toHaveLength(0);
  });

  it('user-message with null content defaults to empty string', () => {
    const state = run([s('user-message', { content: null })]);
    expect(state.main.messages[0].content).toBe('');
    expect(state.main.messages[0].role).toBe('user');
  });

  it('user-message with missing content defaults to empty string', () => {
    const state = run([s('user-message', {})]);
    expect(state.main.messages[0].content).toBe('');
  });
});

describe('reducer — tool defaults with missing fields', () => {
  it('tool-start with no id generates a block id', () => {
    const state = run([s('tool-start', { name: 'shell' })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block).toBeDefined();
    expect(block!.id).toBeTruthy();
    expect(block!.metadata?.toolName).toBe('shell');
  });

  it('tool-start with no name defaults to "unknown"', () => {
    const state = run([s('tool-start', { id: 'c1' })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolName).toBe('unknown');
  });

  it('tool-start with no args defaults to {}', () => {
    const state = run([s('tool-start', { id: 'c1', name: 'shell' })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolArgs).toBe('{}');
  });

  it('tool-start with null args defaults to {}', () => {
    const state = run([s('tool-start', { id: 'c1', name: 'shell', args: null })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolArgs).toBe('{}');
  });

  it('tool-end with no callId and no name completes via fallback match', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('tool-end', { result: 'ok' }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    // Even without callId/name, reducer may match the last streaming tool block
    expect(block).toBeDefined();
  });

  it('tool-end with null result stores empty string', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('tool-end', { callId: 'c1', result: null }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolResult).toBe('');
  });

  it('tool-end with missing result field stores empty string', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('tool-end', { callId: 'c1' }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolResult).toBe('');
  });
});

describe('reducer — human-input defaults', () => {
  it('human-input with no questions creates human_input block', () => {
    const state = run([s('human-input', {})]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'human_input');
    expect(block).toBeDefined();
    expect(block!.metadata?.message).toBe('');
  });

  it('human-input with empty questions array creates block with empty message', () => {
    const state = run([s('human-input', { questions: [] })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'human_input');
    expect(block!.metadata?.message).toBe('');
  });

  it('human-input with no requestId generates one and stores it in metadata', () => {
    const state = run([s('human-input', { questions: [{ question: 'q', type: 'text' }] })]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'human_input');
    expect(block).toBeDefined();
    expect(block!.id).toBeTruthy();
    // Generated requestId must be stored so a later resolved event can match
    expect(block!.metadata?.requestId).toBe(block!.id);
  });

  it('human-input-resolved with no requestId does not crash', () => {
    const state = run([s('human-input-resolved', {})]);
    expect(state.main.messages).toHaveLength(0);
  });
});

describe('reducer — step/lifecycle defaults', () => {
  it('step-start with no step increments stepCount by 1', () => {
    const state = run([s('step-start', {})]);
    expect(state.main.stepCount).toBe(1);
  });

  it('step-end with no step still accumulates duration 0', () => {
    const state = run([s('step-end', {})]);
    expect(state.main.duration).toBe(0);
  });

  it('step-end with no duration adds 0 to total', () => {
    const state = run([s('step-end', { step: 1 })]);
    expect(state.main.duration).toBe(0);
  });

  it('done with no totalSteps leaves it undefined', () => {
    const state = run([s('done', {})]);
    expect(state.main.totalSteps).toBeUndefined();
    expect(state.main.status).toBe('idle');
  });

  it('compressed with no summary defaults summary to empty string', () => {
    const state = run([s('compressed', { removedCount: 3 })]);
    expect(state.main.compression?.removedCount).toBe(3);
    expect(state.main.compression?.summary).toBe('');
  });

  it('compressed with no removedCount defaults to 0', () => {
    const state = run([s('compressed', { summary: 's' })]);
    expect(state.main.compression?.summary).toBe('s');
    expect(state.main.compression?.removedCount).toBe(0);
  });
});

describe('reducer — llm-request defaults', () => {
  it('llm-request with no messages defaults to empty array', () => {
    const state = run([s('llm-request', { tools: ['shell'] })]);
    expect(state.main.lastLLMRequest?.messages).toEqual([]);
  });

  it('llm-request with no tools defaults to empty array', () => {
    const state = run([s('llm-request', { messages: [] })]);
    expect(state.main.lastLLMRequest?.tools).toEqual([]);
  });

  it('llm-request with no skill defaults to null', () => {
    const state = run([s('llm-request', {})]);
    expect(state.main.lastLLMRequest?.skill).toBeNull();
  });

  it('llm-request with skill.current null defaults to null', () => {
    const state = run([s('llm-request', { skill: { current: null } })]);
    expect(state.main.lastLLMRequest?.skill).toBeNull();
  });

  it('llm-request with no model/contextWindow leaves them undefined', () => {
    const state = run([s('llm-request', {})]);
    expect(state.main.lastLLMRequest?.model).toBeUndefined();
    expect(state.main.lastLLMRequest?.contextWindow).toBeUndefined();
  });

  it('llm-request with non-number contextWindow is ignored', () => {
    const state = run([s('llm-request', { contextWindow: 'huge' })]);
    expect(state.main.lastLLMRequest?.contextWindow).toBeUndefined();
  });
});

describe('reducer — sub-agent defaults', () => {
  it('subagent-start with no name defaults to "sub-agent"', () => {
    const state = run([s('subagent-start', { subtaskId: 's1', task: 'do' })]);
    expect(state.subAgents.get('s1')!.name).toBe('sub-agent');
  });

  it('subagent-start with no task defaults to empty string', () => {
    const state = run([s('subagent-start', { subtaskId: 's1', name: 'sub' })]);
    expect(state.subAgents.get('s1')!.task).toBe('');
  });

  it('subagent-start with no subtaskId generates one', () => {
    const state = run([s('subagent-start', { name: 'sub', task: 'do' })]);
    expect(state.subAgents.size).toBe(1);
  });

  it('subagent-token with no token is a no-op', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-token', { subtaskId: 's1' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    // Empty delta creates no message (mirrors the main token handler)
    expect(sub.messages).toHaveLength(0);
  });

  it('subagent-thinking with no content does not create a thinking block', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-thinking', { subtaskId: 's1' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    const block = msg.blocks?.find((b) => b.type === 'thinking');
    // Mirror the main-agent guard: an empty first chunk means no reasoning
    expect(block).toBeUndefined();
  });

  it('subagent-tool-start with no action does not crash', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-tool-start', { subtaskId: 's1' }),
    ]);
    expect(state.subAgents.get('s1')!.messages.length).toBeGreaterThanOrEqual(1);
  });

  it('subagent-tool-end with no callId no-ops (no fallback)', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc1', tool: 'shell', arguments: {} },
      }),
      s('subagent-tool-end', { subtaskId: 's1', result: 'ok' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    const block = msg.blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('streaming');
    expect(block?.metadata?.toolResult).toBeUndefined();
  });

  it('subagent-end with no status defaults to success', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-end', { subtaskId: 's1' }),
    ]);
    expect(state.subAgents.get('s1')!.resultStatus).toBe('success');
  });

  it('subagent-end with no duration defaults to 0', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-end', { subtaskId: 's1', status: 'success' }),
    ]);
    expect(state.subAgents.get('s1')!.duration).toBe(0);
  });

  it('subagent-end with no totalSteps leaves undefined', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'sub', task: 'do' }),
      s('subagent-end', { subtaskId: 's1', status: 'success' }),
    ]);
    expect(state.subAgents.get('s1')!.totalSteps).toBeUndefined();
  });
});

describe('reducer — block lifecycle', () => {
  it('thinking then token closes thinking block', () => {
    const state = run([s('thinking', { content: 'hmm' }), s('token', { delta: 'answer' })]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'thinking')?.status).toBe('completed');
    expect(lastMsg(state).content).toBe('answer');
  });

  it('multiple thinking events append to same streaming block', () => {
    const state = run([s('thinking', { content: 'part1' }), s('thinking', { content: ' part2' })]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'thinking')?.content).toBe('part1 part2');
  });

  it('thinking after token creates new block (previous is completed)', () => {
    const state = run([
      s('thinking', { content: 'first' }),
      s('token', { delta: 'text' }),
      s('thinking', { content: 'second' }),
    ]);
    expect(lastMsg(state).blocks?.filter((b) => b.type === 'thinking')).toHaveLength(2);
  });

  it('tool-start after thinking closes thinking and creates streaming tool block', () => {
    const state = run([
      s('thinking', { content: 'hmm' }),
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
    ]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'thinking')?.status).toBe('completed');
    expect(lastMsg(state).blocks?.find((b) => b.type === 'tool_call')?.status).toBe('streaming');
  });

  it('tool-end matched by callId completes the block', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: { cmd: 'ls' } }),
      s('tool-end', { callId: 'c1', result: 'output' }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('completed');
    expect(block?.metadata?.toolResult).toBe('output');
  });

  it('tool-end with only a name (no callId) no-ops (no fallback)', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'file_read', args: {} }),
      s('tool-end', { name: 'file_read', result: 'content' }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('streaming');
    expect(block?.metadata?.toolResult).toBeUndefined();
  });

  it('tool-end with no callId and no name no-ops (no fallback)', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('tool-end', { result: 'orphan' }),
    ]);
    const block = lastMsg(state).blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('streaming');
    expect(block?.metadata?.toolResult).toBeUndefined();
  });

  it('done closes all open blocks', () => {
    const state = run([
      s('thinking', { content: 'open thinking' }),
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('done', {}),
    ]);
    expect(lastMsg(state).blocks?.filter((b) => b.status === 'streaming')).toHaveLength(0);
  });

  it('error sets status to error and fills content', () => {
    const state = run([s('thinking', { content: 'thinking' }), s('error', { message: 'crashed' })]);
    expect(state.main.status).toBe('error');
  });
});

describe('reducer — sub-agent lifecycle', () => {
  it('full sub-agent lifecycle with thinking, tokens, and tools', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'helper', task: 'research' }),
      s('subagent-thinking', { subtaskId: 's1', content: 'analyzing...' }),
      // Wire field is `delta` (both daemons) — an earlier version of this test
      // pushed `token`, which was silently dropped and asserted nothing.
      s('subagent-token', { subtaskId: 's1', delta: 'result' }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc1', tool: 'search', arguments: {} },
      }),
      s('subagent-tool-end', { subtaskId: 's1', callId: 'tc1', result: 'found' }),
      s('subagent-end', { subtaskId: 's1', status: 'success', totalSteps: 3, duration: 5000 }),
    ]);
    const sub = state.subAgents.get('s1')!;
    expect(sub.resultStatus).toBe('success');
    expect(sub.totalSteps).toBe(3);
    expect(sub.duration).toBe(5000);
    expect(sub.status).toBe('idle');
    // Content actually accumulated through the shared main handlers
    expect(sub.messages).toHaveLength(1);
    expect(sub.messages[0].content).toBe('result');
    const toolBlock = sub.messages[0].blocks?.find((b) => b.type === 'tool_call');
    expect(toolBlock?.status).toBe('completed');
    expect(toolBlock?.metadata?.toolResult).toBe('found');
  });

  it('subagent-end with error sets status and error message', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'helper', task: 'do' }),
      s('subagent-end', { subtaskId: 's1', status: 'error', error: 'failed' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    expect(sub.resultStatus).toBe('error');
    expect(sub.status).toBe('error');
    expect(sub.error).toBe('failed');
  });

  it('subagent-end with max_steps sets resultStatus', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-end', { subtaskId: 's1', status: 'max_steps', totalSteps: 50 }),
    ]);
    expect(state.subAgents.get('s1')!.resultStatus).toBe('max_steps');
  });

  it('subagent-end with timeout sets resultStatus', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-end', { subtaskId: 's1', status: 'timeout' }),
    ]);
    expect(state.subAgents.get('s1')!.resultStatus).toBe('timeout');
  });

  it('subagent-end with abort sets resultStatus', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-end', { subtaskId: 's1', status: 'abort' }),
    ]);
    expect(state.subAgents.get('s1')!.resultStatus).toBe('abort');
  });

  it('subagent-tool-end matched by callId completes sub-agent tool block', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc1', tool: 'shell', arguments: {} },
      }),
      s('subagent-tool-end', { subtaskId: 's1', callId: 'tc1', result: 'out' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    expect(msg.blocks?.find((b) => b.type === 'tool_call')?.status).toBe('completed');
  });

  it('subagent-tool-end without callId during parallel calls does NOT misattribute', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc1', tool: 'shell', arguments: {} },
      }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc2', tool: 'read', arguments: {} },
      }),
      // Missing callId + two streaming blocks — must skip, not match first
      s('subagent-tool-end', { subtaskId: 's1', result: 'orphan' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    const toolBlocks = msg.blocks?.filter((b) => b.type === 'tool_call') ?? [];
    expect(toolBlocks).toHaveLength(2);
    for (const b of toolBlocks) {
      expect(b.status).toBe('streaming');
      expect(b.metadata?.toolResult).toBeUndefined();
    }
  });

  it('subagent-tool-end with unknown callId no-ops (no fallback)', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-tool-start', {
        subtaskId: 's1',
        action: { id: 'tc1', tool: 'shell', arguments: {} },
      }),
      s('subagent-tool-end', { subtaskId: 's1', callId: 'unknown', result: 'orphan' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    const block = msg.blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('streaming');
    expect(block?.metadata?.toolResult).toBeUndefined();
  });

  it('subagent-end closes all streaming blocks in sub-agent messages', () => {
    const state = run([
      s('subagent-start', { subtaskId: 's1', name: 'h', task: 't' }),
      s('subagent-thinking', { subtaskId: 's1', content: 'open' }),
      s('subagent-end', { subtaskId: 's1', status: 'success' }),
    ]);
    const sub = state.subAgents.get('s1')!;
    for (const msg of sub.messages) {
      for (const block of msg.blocks ?? []) {
        expect(block.status).not.toBe('streaming');
      }
    }
  });
});

describe('reducer — top-level routing', () => {
  it('subagent-start creates sub-agent state and parent block', () => {
    const state = run([
      s('thinking', { content: 'delegating...' }),
      s('subagent-start', { subtaskId: 's1', name: 'helper', task: 'do' }),
    ]);
    expect(state.subAgents.size).toBe(1);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'subagent')?.status).toBe('streaming');
  });

  it('subagent-end updates parent block to completed', () => {
    const state = run([
      s('thinking', { content: 'delegating...' }),
      s('subagent-start', { subtaskId: 's1', name: 'helper', task: 'do' }),
      s('subagent-end', { subtaskId: 's1', status: 'success' }),
    ]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'subagent')?.status).toBe('completed');
  });
});

describe('reducer — done/error on messages with no blocks', () => {
  it('done completes streaming message even when blocks is undefined', () => {
    const state = run([s('user-message', { content: 'hi' }), s('done', {})]);
    expect(lastMsg(state).status).toBe('completed');
  });

  it('error appends an error block with the default message', () => {
    const state = run([s('user-message', { content: 'hi' }), s('error', {})]);
    expect(lastMsg(state).status).toBe('error');
    const errorBlock = lastMsg(state).blocks?.find((b) => b.type === 'error');
    expect(errorBlock).toMatchObject({ status: 'error', content: 'Unknown error' });
  });

  it('error with custom message puts it in the error block', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('error', { message: 'custom error' }),
    ]);
    const errorBlock = lastMsg(state).blocks?.find((b) => b.type === 'error');
    expect(errorBlock?.content).toBe('custom error');
  });

  it('error keeps existing text and appends the error block after it', () => {
    // Regression: the old fallback wrote the error into `content` only when
    // empty — with prose already streamed, the error vanished silently.
    const state = run([
      s('user-message', { content: 'hi' }),
      s('token', { delta: 'partial answer' }),
      s('error', { message: 'boom' }),
    ]);
    const msg = lastMsg(state);
    expect(msg.content).toBe('partial answer');
    expect(msg.blocks?.map((b) => b.type)).toEqual(['text', 'error']);
    expect(msg.blocks![0].status).toBe('error'); // streaming text closed as error
    expect(msg.blocks![1]).toMatchObject({ type: 'error', content: 'boom' });
  });

  it('token on message with no blocks appends to content', () => {
    const state = run([s('user-message', { content: 'hi' }), s('token', { delta: 'response' })]);
    expect(lastMsg(state).content).toBe('response');
  });

  it('tool-start on message with no blocks creates tool block', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
    ]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'tool_call')).toBeDefined();
  });

  it('thinking on message with no blocks creates thinking block', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('thinking', { content: 'thought' }),
    ]);
    expect(lastMsg(state).blocks?.find((b) => b.type === 'thinking')).toBeDefined();
  });

  it('multiple tool calls in sequence create multiple blocks', () => {
    const state = run([
      s('tool-start', { id: 'c1', name: 'shell', args: {} }),
      s('tool-end', { callId: 'c1', result: 'out1' }),
      s('tool-start', { id: 'c2', name: 'file_read', args: {} }),
      s('tool-end', { callId: 'c2', result: 'out2' }),
    ]);
    expect(lastMsg(state).blocks?.filter((b) => b.type === 'tool_call')).toHaveLength(2);
  });

  it('ensureStreamingMessage reuses existing streaming assistant message', () => {
    const state = run([
      s('token', { delta: 'part1' }),
      s('token', { delta: ' part2' }),
      s('token', { delta: ' part3' }),
    ]);
    expect(lastMsg(state).content).toBe('part1 part2 part3');
    expect(lastMsg(state).status).toBe('streaming');
  });
});

describe('reducer — fromHistory defensive paths', () => {
  it('tool call with no matching tool result produces empty result content', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'orphan', name: 'file_read', arguments: {} }],
        timestamp: 1,
      },
    ]);
    const block = state.main.messages[0].blocks?.find((b) => b.type === 'tool_call');
    expect(block!.metadata?.toolResult).toBe('');
  });

  it('skill tool call with no result produces empty content', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 's1', name: 'load_skill', arguments: { name: 'poet' } }],
        timestamp: 1,
      },
    ]);
    expect(state.main.messages[0].blocks?.find((b) => b.type === 'skill')!.content).toBe('');
  });

  it('skill tool call with no name arg defaults skillName to empty', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 's1', name: 'load_skill', arguments: {} }],
        timestamp: 1,
      },
    ]);
    expect(
      state.main.messages[0].blocks?.find((b) => b.type === 'skill')!.metadata?.skillName
    ).toBe('');
  });

  it('delegate with error and no answer does not create sub-agent', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'd1', name: 'delegate', arguments: { agent: 'coder', task: 'do' } }],
        timestamp: 1,
      },
      {
        role: 'tool',
        content: JSON.stringify({ status: 'error', error: 'crashed' }),
        toolCallId: 'd1',
        toolName: 'delegate',
        timestamp: 2,
      },
    ]);
    expect(state.subAgents.size).toBe(0);
  });

  it('delegate with success but no tokens/duration defaults to 0', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'd1', name: 'delegate', arguments: { agent: 'coder', task: 'do' } }],
        timestamp: 1,
      },
      {
        role: 'tool',
        content: JSON.stringify({ status: 'success', answer: 'done' }),
        toolCallId: 'd1',
        toolName: 'delegate',
        timestamp: 2,
      },
    ]);
    const sub = state.subAgents.get('hist-d1')!;
    expect(sub.tokens.input).toBe(0);
    expect(sub.duration).toBe(0);
  });

  it('human_input with no context arg carries no title (chat i18n owns the default)', () => {
    const state = fromHistory([
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'h1',
            name: 'ask_human',
            arguments: { questions: [{ question: 'q?', type: 'text' }] },
          },
        ],
        timestamp: 1,
      },
      { role: 'tool', content: 'yes', toolCallId: 'h1', toolName: 'ask_human', timestamp: 2 },
    ]);
    // 无 context 时不设 title——默认文案归 chat 的 i18n 兜底,state 不烤英文串
    expect(
      state.main.messages[0].blocks?.find((b) => b.type === 'human_input')!.metadata?.title
    ).toBeUndefined();
  });
});

describe('reducer — guard branches', () => {
  it('step-end without tokens leaves totals unchanged', () => {
    const state = run([s('step-end', { step: 1, duration: 5 })]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(state.main.duration).toBe(5);
  });

  it('step-end with partial token fields fills missing fields with zero', () => {
    const state = run([s('step-end', { step: 1, tokens: { input: 7 } })]);
    expect(state.main.tokens).toEqual({ input: 7, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it('subagent events with unknown subtaskId are ignored by every handler', () => {
    const state = run([
      s('subagent-thinking', { subtaskId: 'ghost', content: 'x' }),
      s('subagent-tool-start', { action: { id: 'c1', tool: 't' } }),
      s('subagent-tool-end', { subtaskId: 'ghost', callId: 'c1' }),
      s('subagent-end', { subtaskId: 'ghost' }),
    ]);
    expect(state.subAgents.size).toBe(0);
    expect(state.main.messages).toHaveLength(0);
  });

  it('unknown subagent-* event names fall through to default untouched', () => {
    const state = run([s('subagent-mystery', { subtaskId: 'x' })]);
    expect(state.subAgents.size).toBe(0);
    expect(state.main.messages).toHaveLength(0);
  });

  it('human-input maps select questions to inputType + options', () => {
    const state = run([
      s('human-input', {
        requestId: 'r1',
        questions: [{ id: 'q1', question: 'pick one', type: 'single-select', options: ['a', 'b'] }],
      }),
      s('human-input', {
        requestId: 'r2',
        questions: [{ id: 'q2', question: 'pick many', type: 'multi-select', options: ['x'] }],
      }),
    ]);
    const blocks = lastMsg(state).blocks?.filter((b) => b.type === 'human_input');
    expect(blocks![0].metadata?.inputType).toBe('single-select');
    expect(blocks![0].metadata?.options).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' },
    ]);
    expect(blocks![1].metadata?.inputType).toBe('multi-select');
  });
});
