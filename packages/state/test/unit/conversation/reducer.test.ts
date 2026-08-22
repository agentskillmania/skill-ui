/**
 * @fileoverview Reducer unit tests — SSE event → SessionRunState
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SessionRunState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

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

  it('forwards optional toolType from tool-start into block metadata', () => {
    const state = pushEvents([
      {
        event: 'tool-start',
        data: { id: 'call-1', name: 'fs__read', args: {}, toolType: 'mcp' },
      },
      { event: 'tool-start', data: { id: 'call-2', name: 'web_fetch', args: {} } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const blocks = msg.blocks?.filter((b) => b.type === 'tool_call');
    expect(blocks?.[0].metadata?.toolType).toBe('mcp');
    // 未携带时不写入(undefined 不落进 metadata,保持旧形状)
    expect(blocks?.[1].metadata).not.toHaveProperty('toolType');
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

  it('renders live load_skill tool call as skill block (parity with history)', () => {
    // daemon 实时以 tool-start/tool-end 携带 load_skill，不另发 skill-* 事件；
    // 展示必须与 fromHistory 的 SKILL_TOOL 特判一致，否则只有历史会话能看到 skill 块
    const state = pushEvents([
      { event: 'tool-start', data: { id: 'call-s1', name: 'load_skill', args: { name: 'poet' } } },
      { event: 'tool-end', data: { callId: 'call-s1', result: 'loaded 3 instructions' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const skillBlock = msg.blocks?.find((b) => b.type === 'skill');
    expect(skillBlock).toBeDefined();
    expect(skillBlock!.status).toBe('completed');
    expect(skillBlock!.metadata?.skillName).toBe('poet');
    expect(skillBlock!.metadata?.phase).toBe('completed');
    expect(skillBlock!.metadata?.result).toBe('loaded 3 instructions');
    expect(msg.blocks?.some((b) => b.type === 'tool_call')).toBe(false);
  });

  it('completes ALL parallel tool_call blocks with their own results', () => {
    // Parallel tool invocations arrive as a burst of tool-start events (the
    // daemon splits ToolsStart into per-call tool-start frames), followed by
    // a burst of tool-end frames. Each block must stay streaming until its
    // own tool-end matches by call id — an earlier tool-start must not close
    // the previously created blocks (regression: closeThinkingBlocks used to
    // close every streaming block, so only the LAST tool_call completed).
    const state = pushEvents([
      {
        event: 'tool-start',
        data: { id: 'call-1', name: 'web_search', args: { query: 'AI 新闻' } },
      },
      {
        event: 'tool-start',
        data: { id: 'call-2', name: 'web_search', args: { query: 'AI news' } },
      },
      { event: 'tool-start', data: { id: 'call-3', name: 'web_search', args: { query: 'GPT' } } },
      { event: 'tool-end', data: { callId: 'call-1', result: 'results-1' } },
      { event: 'tool-end', data: { callId: 'call-2', result: 'results-2' } },
      { event: 'tool-end', data: { callId: 'call-3', result: 'results-3' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const toolBlocks = msg.blocks?.filter((b) => b.type === 'tool_call') ?? [];
    expect(toolBlocks).toHaveLength(3);
    for (const b of toolBlocks) {
      expect(b.status).toBe('completed');
    }
    const byId = new Map(toolBlocks.map((b) => [b.id, b.metadata?.toolResult]));
    expect(byId.get('call-1')).toBe('results-1');
    expect(byId.get('call-2')).toBe('results-2');
    expect(byId.get('call-3')).toBe('results-3');
  });

  it('does NOT fall back to first streaming tool_call when callId is missing during parallel calls', () => {
    // Regression: with parallel tool calls and no callId (e.g. a provider
    // that omits it), the old fallback matched the FIRST streaming block,
    // misattributing results and leaving the real target spinning forever.
    // Now the fallback only fires when there is a single candidate.
    const state = pushEvents([
      { event: 'tool-start', data: { id: 'call-1', name: 'web_search', args: { q: 'a' } } },
      { event: 'tool-start', data: { id: 'call-2', name: 'file_read', args: { p: '/x' } } },
      // No callId — cannot disambiguate, must skip rather than misattribute
      { event: 'tool-end', data: { result: 'early-result' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const toolBlocks = msg.blocks?.filter((b) => b.type === 'tool_call') ?? [];
    expect(toolBlocks).toHaveLength(2);
    for (const b of toolBlocks) {
      expect(b.status).toBe('streaming');
      expect(b.metadata?.toolResult).toBeUndefined();
    }
  });

  it('single streaming tool_call still completes via fallback when callId is missing', () => {
    // Backward compat: providers that omit callId on tool-end must still work
    // for sequential (non-parallel) tool calls.
    const state = pushEvents([
      { event: 'tool-start', data: { id: 'call-1', name: 'file_read', args: { path: '/x' } } },
      { event: 'tool-end', data: { result: 'file content' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const block = msg.blocks?.find((b) => b.type === 'tool_call');
    expect(block?.status).toBe('completed');
    expect(block?.metadata?.toolResult).toBe('file content');
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

  it('llm-response updates lastInputTokens without touching cumulative totals', () => {
    // 累计账由 step-end 统一负责(每次 LLM 调用恰有一次 step-end);
    // llm-response 携带的是同一次调用的 tokens,在这里累加会双计。
    const state = pushEvents([
      {
        event: 'llm-response',
        data: { text: 'hi', tokens: { input: 100, output: 50, cacheRead: 10, cacheWrite: 5 } },
      },
      {
        event: 'llm-response',
        data: { text: 'bye', tokens: { input: 200, output: 30, cacheRead: 0, cacheWrite: 0 } },
      },
    ]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(state.main.lastInputTokens).toBe(200);
  });

  it('records step count and duration from step events', () => {
    const state = pushEvents([
      { event: 'step-start', data: { step: 0 } },
      {
        event: 'step-end',
        data: {
          step: 0,
          tokens: { input: 10, output: 5, cacheRead: 0, cacheWrite: 0 },
          duration: 1500,
        },
      },
      { event: 'step-start', data: { step: 1 } },
      {
        event: 'step-end',
        data: {
          step: 1,
          tokens: { input: 20, output: 10, cacheRead: 0, cacheWrite: 0 },
          duration: 2000,
        },
      },
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

describe('reducer — todo-list events', () => {
  it('stores the todo-list snapshot (Rust wire shape)', () => {
    const state = pushEvents([
      {
        event: 'todo-list',
        data: {
          items: [
            { id: 1, subject: 'search', status: 'completed' },
            {
              id: 2,
              subject: 'write report',
              status: 'in_progress',
              description: 'md',
              blocks: [3],
            },
            { id: 3, subject: 'review', status: 'pending', blocked_by: [2] },
          ],
        },
      },
    ]);
    expect(state.main.todoList?.items).toEqual([
      { id: 1, subject: 'search', status: 'completed' },
      { id: 2, subject: 'write report', status: 'in_progress', description: 'md', blocks: [3] },
      { id: 3, subject: 'review', status: 'pending', blocked_by: [2] },
    ]);
    // Todo events are also recorded in the event log
    expect(state.events.at(-1)?.type).toBe('todo-list');
  });

  it('replaces the previous snapshot when the list changes', () => {
    const state = pushEvents([
      { event: 'todo-list', data: { items: [{ id: 1, subject: 'a', status: 'pending' }] } },
      { event: 'todo-list', data: { items: [{ id: 1, subject: 'a', status: 'in_progress' }] } },
    ]);
    expect(state.main.todoList?.items).toEqual([{ id: 1, subject: 'a', status: 'in_progress' }]);
  });

  it('tolerates malformed todo-list payloads', () => {
    const state = pushEvents([
      { event: 'todo-list', data: { items: 'nope' } },
      { event: 'todo-list', data: {} },
      { event: 'todo-list', data: { items: [{ subject: 'no-id' }, 'junk', null] } },
    ]);
    // Invalid payloads produce an empty list without crashing
    expect(state.main.todoList?.items).toEqual([]);
  });
});

describe('reducer — sub-agent events', () => {
  it('creates sub-agent on subagent-start and block on parent message', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'Let me delegate.' } },
      {
        event: 'subagent-start',
        data: { name: 'researcher', task: 'find papers', subtaskId: 'sa-1' },
      },
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
    // Flat token fields (SubAgentBlockMetadata shape) + conversation messages
    expect(subBlock!.metadata?.inputTokens).toBe(500);
    expect(subBlock!.metadata?.outputTokens).toBe(200);
    const blockMessages = subBlock!.metadata?.messages as Array<{ role: string; content: string }>;
    expect(blockMessages).toHaveLength(1);
    expect(blockMessages[0].role).toBe('assistant');
    expect(blockMessages[0].content).toBe('result');
  });
});

describe('reducer — negative paths', () => {
  it('handles unknown event types without crashing', () => {
    const state = pushEvents([{ event: 'unknown-event', data: { foo: 'bar' } }]);
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
    // Empty token delta is a no-op — no message, no block, no crash
    expect(state.main.status).toBe('idle');
    expect(state.main.messages).toHaveLength(0);
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

describe('reducer — extractTokens boundary', () => {
  it('llm-response with null tokens leaves state tokens unchanged', () => {
    const state = pushEvents([{ event: 'llm-response', data: { text: 'hi', tokens: null } }]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it('llm-response with partial tokens updates lastInputTokens only', () => {
    const state = pushEvents([
      { event: 'llm-response', data: { text: 'hi', tokens: { input: 50 } } },
    ]);
    // 累计账不动(归 step-end 管);lastInputTokens 取正读数。
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(state.main.lastInputTokens).toBe(50);
  });

  it('step-end without tokens field leaves tokens unchanged', () => {
    const state = pushEvents([{ event: 'step-end', data: { step: 0, duration: 100 } }]);
    expect(state.main.tokens).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    expect(state.main.duration).toBe(100);
  });

  it('step-end with tokens accumulates both tokens and duration', () => {
    const state = pushEvents([
      {
        event: 'step-end',
        data: {
          step: 0,
          tokens: { input: 30, output: 10, cacheRead: 5, cacheWrite: 0 },
          duration: 200,
        },
      },
      {
        event: 'step-end',
        data: {
          step: 1,
          tokens: { input: 20, output: 5, cacheRead: 0, cacheWrite: 2 },
          duration: 300,
        },
      },
    ]);
    expect(state.main.tokens).toEqual({ input: 50, output: 15, cacheRead: 5, cacheWrite: 2 });
    expect(state.main.duration).toBe(500);
  });

  it('done overrides duration/totalSteps but does not re-add tokens', () => {
    // tokens 的累计在 step-end 完成;done 携带的是整轮累计值(信息性),
    // 再累加会重复计数。
    const state = pushEvents([
      { event: 'token', data: { delta: 'answer' } },
      {
        event: 'step-end',
        data: {
          step: 0,
          tokens: { input: 200, output: 80, cacheRead: 10, cacheWrite: 5 },
          duration: 4800,
        },
      },
      {
        event: 'done',
        data: {
          type: 'success',
          totalSteps: 3,
          tokens: { input: 200, output: 80, cacheRead: 10, cacheWrite: 5 },
          duration: 5000,
        },
      },
    ]);
    expect(state.main.status).toBe('idle');
    expect(state.main.tokens).toEqual({ input: 200, output: 80, cacheRead: 10, cacheWrite: 5 });
    expect(state.main.totalSteps).toBe(3);
    expect(state.main.duration).toBe(5000);
  });
});

describe('reducer — empty token events', () => {
  it('empty token must not close a streaming thinking block (LLM emits empty content deltas between reasoning segments)', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: 'First segment' } },
      { event: 'token', data: { delta: '' } }, // empty delta — segment boundary
      { event: 'thinking', data: { content: 'Second segment' } },
      { event: 'token', data: { delta: 'Answer' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const thinkingBlocks = msg.blocks?.filter((b) => b.type === 'thinking') ?? [];
    expect(thinkingBlocks).toHaveLength(1); // segments merged into one block
    expect(thinkingBlocks[0].content).toBe('First segmentSecond segment');
    // Only the REAL token closes the block
    expect(thinkingBlocks[0].status).toBe('completed');
    expect(msg.content).toBe('Answer');
  });

  it('empty token does not close open blocks but keeps them streaming', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: 'Hmm' } },
      { event: 'token', data: { delta: '' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const thinkingBlock = msg.blocks?.find((b) => b.type === 'thinking');
    expect(thinkingBlock?.status).toBe('streaming');
    expect(msg.content).toBe('');
  });
});

describe('reducer — text blocks & interleaved ordering', () => {
  it('keeps the full chronological order: thinking → text → tool → thinking → text', () => {
    // The core invariant of text-as-block: every segment lands in the blocks
    // array exactly where it happened, so live rendering matches resume.
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'thinking', data: { content: '思考A' } },
      { event: 'token', data: { delta: '我先查一下' } },
      { event: 'tool-start', data: { id: 'c1', name: 'search', args: { q: 'x' } } },
      { event: 'tool-end', data: { callId: 'c1', result: 'found' } },
      { event: 'thinking', data: { content: '思考B' } },
      { event: 'token', data: { delta: '结论如下' } },
      { event: 'done', data: { status: 'success' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    expect(msg.blocks?.map((b) => b.type)).toEqual([
      'thinking',
      'text',
      'tool_call',
      'thinking',
      'text',
    ]);
    expect(msg.blocks?.map((b) => b.content)).toEqual([
      '思考A',
      '我先查一下',
      '',
      '思考B',
      '结论如下',
    ]);
    // Everything terminal after done; derived content is the text concat.
    expect(msg.blocks?.every((b) => b.status === 'completed')).toBe(true);
    expect(msg.content).toBe('我先查一下结论如下');
  });

  it('consecutive tokens merge into one trailing text block', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'Hello' } },
      { event: 'token', data: { delta: ' world' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const textBlocks = msg.blocks?.filter((b) => b.type === 'text') ?? [];
    expect(textBlocks).toHaveLength(1);
    expect(textBlocks[0].content).toBe('Hello world');
    expect(textBlocks[0].status).toBe('streaming');
  });

  it('a tool call splits prose into two separate text blocks', () => {
    const state = pushEvents([
      { event: 'token', data: { delta: 'before tool' } },
      { event: 'tool-start', data: { id: 'c1', name: 'shell', args: {} } },
      { event: 'tool-end', data: { callId: 'c1', result: 'ok' } },
      { event: 'token', data: { delta: 'after tool' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    expect(msg.blocks?.map((b) => b.type)).toEqual(['text', 'tool_call', 'text']);
  });

  it('sub-agent tokens interleave text/thinking/tool blocks in arrival order', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 's1', name: 'sub', task: 'do' } },
      { event: 'subagent-thinking', data: { subtaskId: 's1', content: 'sub thought' } },
      { event: 'subagent-token', data: { subtaskId: 's1', delta: 'sub prose' } },
      {
        event: 'subagent-tool-start',
        data: { subtaskId: 's1', action: { id: 'sc1', tool: 'shell', arguments: {} } },
      },
      { event: 'subagent-tool-end', data: { subtaskId: 's1', callId: 'sc1', result: 'ok' } },
      { event: 'subagent-token', data: { subtaskId: 's1', delta: 'sub final' } },
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    expect(msg.blocks?.map((b) => b.type)).toEqual(['thinking', 'text', 'tool_call', 'text']);
    expect(msg.content).toBe('sub prosesub final');
  });

  it('forwards optional toolType from subagent-tool-start action into metadata', () => {
    const state = pushEvents([
      { event: 'subagent-start', data: { subtaskId: 's1', name: 'sub', task: 'do' } },
      {
        event: 'subagent-tool-start',
        data: {
          subtaskId: 's1',
          action: { id: 'sc1', tool: 'fs__read', arguments: {}, toolType: 'mcp' },
        },
      },
      {
        event: 'subagent-tool-start',
        data: { subtaskId: 's1', action: { id: 'sc2', tool: 'web_fetch', arguments: {} } },
      },
    ]);
    const sub = state.subAgents.get('s1')!;
    const msg = sub.messages[sub.messages.length - 1];
    const blocks = msg.blocks?.filter((b) => b.type === 'tool_call');
    expect(blocks?.[0].metadata?.toolType).toBe('mcp');
    expect(blocks?.[1].metadata).not.toHaveProperty('toolType');
  });
});

describe('reducer — empty thinking events', () => {
  it('empty thinking must not create a block (LLM streams an empty reasoning_content first)', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: '' } },
      { event: 'token', data: { delta: '你好' } },
      { event: 'done', data: { status: 'success' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    // No thinking block — but the real token DID open a text block.
    expect(msg.blocks?.filter((b) => b.type === 'thinking') ?? []).toHaveLength(0);
    expect(msg.blocks?.map((b) => b.type)).toEqual(['text']);
    expect(msg.blocks![0]).toMatchObject({ type: 'text', content: '你好', status: 'completed' });
    expect(msg.content).toBe('你好');
  });

  it('empty thinking appends nothing to an open block and never creates one', () => {
    const state = pushEvents([
      { event: 'thinking', data: { content: '' } }, // empty first — no block
      { event: 'thinking', data: { content: 'Hi' } }, // real reasoning — creates the block
      { event: 'thinking', data: { content: '' } }, // empty again — appends nothing
      { event: 'token', data: { delta: 'ok' } },
    ]);
    const msg = state.main.messages[state.main.messages.length - 1];
    const thinkingBlocks = msg.blocks?.filter((b) => b.type === 'thinking') ?? [];
    expect(thinkingBlocks).toHaveLength(1);
    expect(thinkingBlocks[0].content).toBe('Hi');
  });
});

describe('reducer — session-cleared (destructive reset)', () => {
  it('drops all messages, resets tokens/todo/compression, keeps the audit log', () => {
    // Populate a busy state: user + assistant messages, tokens, todo, sub-agent
    let state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'token', data: { delta: 'answer' } },
      {
        event: 'llm-response',
        data: { text: 'answer', toolCalls: null, tokens: { input: 100, output: 20 } },
      },
      // 累计账由 step-end 负责(llm-response 只更 lastInputTokens)。
      {
        event: 'step-end',
        data: { step: 0, tokens: { input: 100, output: 20 }, duration: 800 },
      },
      {
        event: 'todo-list',
        data: {
          items: [{ id: 1, subject: 'task', status: 'in_progress' }],
        },
      },
      {
        event: 'subagent-start',
        data: { name: 'helper', task: 'do things', subtaskId: 'sub-1' },
      },
      { event: 'done', data: { status: 'success' } },
    ]);
    expect(state.main.messages.length).toBeGreaterThan(0);
    expect((state.main.tokens as { input: number }).input).toBe(100);
    expect(state.main.todoList?.items.length).toBe(1);
    expect(state.subAgents.size).toBe(1);

    // /clear lands
    state = reducer(state, { event: 'session-cleared', data: {} });

    // 消息被批量丢弃(唯一破坏性路径)
    expect(state.main.messages).toEqual([]);
    // token 计量归零
    expect(state.main.tokens).toEqual({
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    });
    // 会话级残留清空
    expect(state.main.todoList).toBeUndefined();
    expect(state.main.compression).toBeUndefined();
    expect(state.main.activeSkill).toBeNull();
    expect(state.main.lastInputTokens).toBeUndefined();
    // 子代理卡片随顶层 slice 重置
    expect(state.subAgents.size).toBe(0);
    // 事件日志是 append-only 审计:保留且含 session-cleared 条目
    expect(state.events.length).toBeGreaterThan(0);
    expect(state.events.some((e) => e.type === 'session-cleared')).toBe(true);
  });
});
