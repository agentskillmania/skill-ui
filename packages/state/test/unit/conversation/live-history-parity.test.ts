/**
 * @fileoverview Live ↔ history parity — "block-for-block identical" as an
 * executable invariant, not a comment. The same scripted conversation is fed
 * through the live SSE path (reducer) and the resume path (fromHistory);
 * the rebuilt messages must match the live ones.
 *
 * Documented, intentional differences (stripped by the comparator):
 * - ids and createdAt (runtime-generated vs hist- prefixed)
 * - sub-agent metadata.messages (resume cannot reconstruct sub-run internals)
 * - human_input metadata.response (live: host-pushed response object;
 *   history: persisted tool-result string — the render side handles both)
 * - todo card within-bubble position (arrival time is not persisted) — the
 *   cross-TURN anchor is unified though, and gets its own tests below.
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { AgentMessage, TodoItem } from '../../../src/core/conversation/types.js';
import type { ColtsMessageInput, SSEEvent } from '../../../src/core/types.js';

function run(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

/** Strip volatile/known-divergent fields so the comparison is about shape. */
function comparable(messages: AgentMessage[]): unknown {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
    status: m.status,
    ...(m.usage ? { usage: m.usage } : {}),
    blocks: (m.blocks ?? []).map((b) => {
      const { id: _id, metadata, ...rest } = b;
      let meta = metadata;
      if (b.type === 'subagent' && meta) {
        const { messages: _msgs, ...restMeta } = meta;
        meta = restMeta;
      }
      if (b.type === 'human_input' && meta) {
        const { response: _r, ...restMeta } = meta;
        meta = restMeta;
      }
      return { ...rest, metadata: meta };
    }),
  }));
}

describe('live ↔ history parity — golden path', () => {
  const liveEvents: SSEEvent[] = [
    { event: 'user-message', data: { content: 'hi' } },
    { event: 'thinking', data: { content: 'hmm' } },
    { event: 'token', data: { delta: 'Let me check.' } },
    { event: 'tool-start', data: { id: 'c1', name: 'file_read', args: { path: '/a' } } },
    { event: 'tool-end', data: { callId: 'c1', result: 'file content' } },
    { event: 'tool-start', data: { id: 'c2', name: 'load_skill', args: { name: 'pdf' } } },
    { event: 'tool-end', data: { callId: 'c2', result: 'skill body' } },
    {
      event: 'human-input',
      data: {
        requestId: 'h1',
        context: 'need pick',
        questions: [{ id: 'q1', question: 'pick', type: 'single-select', options: ['a', 'b'] }],
      },
    },
    { event: 'human-input-resolved', data: { requestId: 'h1', response: { answer: 'a' } } },
    { event: 'token', data: { delta: 'Done.' } },
    {
      event: 'done',
      data: {
        totalSteps: 2,
        duration: 100,
        tokens: { input: 10, output: 5, cacheRead: 1, cacheWrite: 0 },
      },
    },
  ];

  const historyRows: ColtsMessageInput[] = [
    { role: 'user', content: 'hi', timestamp: 1000 },
    { role: 'assistant', type: 'thought', content: 'hmm', timestamp: 1001 },
    {
      role: 'assistant',
      type: 'action',
      content: 'Let me check.',
      toolCalls: [{ id: 'c1', name: 'file_read', arguments: { path: '/a' } }],
      timestamp: 1002,
    },
    { role: 'tool', toolCallId: 'c1', content: 'file content', timestamp: 1003 },
    {
      role: 'assistant',
      type: 'action',
      content: '',
      toolCalls: [{ id: 'c2', name: 'load_skill', arguments: { name: 'pdf' } }],
      timestamp: 1004,
    },
    { role: 'tool', toolCallId: 'c2', content: 'skill body', timestamp: 1005 },
    {
      role: 'assistant',
      type: 'action',
      content: '',
      toolCalls: [
        {
          id: 'h1',
          name: 'ask_human',
          arguments: {
            context: 'need pick',
            questions: [{ id: 'q1', question: 'pick', type: 'single-select', options: ['a', 'b'] }],
          },
        },
      ],
      timestamp: 1006,
    },
    { role: 'tool', toolCallId: 'h1', content: 'a', timestamp: 1007 },
    {
      role: 'assistant',
      type: 'action',
      content: 'Done.',
      timestamp: 1008,
      usage: { inputTokens: 10, outputTokens: 5, cacheRead: 1, cacheWrite: 0, durationMs: 100 },
    },
  ];

  it('the rebuilt conversation is block-for-block identical to the live one', () => {
    const live = run(liveEvents).main.messages;
    const rebuilt = fromHistory(historyRows).main.messages;
    expect(comparable(rebuilt)).toEqual(comparable(live));
  });

  it('block type order matches across paths', () => {
    const types = (msgs: AgentMessage[]) =>
      msgs.flatMap((m) => (m.blocks ?? []).map((b) => b.type));
    expect(types(fromHistory(historyRows).main.messages)).toEqual(
      types(run(liveEvents).main.messages)
    );
  });
});

describe('todo card — cross-turn anchor (follow the newest turn)', () => {
  const item1: TodoItem = { id: 1, subject: '任务A', status: 'completed' };
  const item2: TodoItem = { id: 2, subject: '任务B', status: 'in_progress' };
  const allTodoCards = (state: ReturnType<typeof run>) =>
    state.main.messages.flatMap((m) => m.blocks ?? []).filter((b) => b.type === 'todo');

  it('moves the singleton card to the newest turn — no copy, no accumulate', () => {
    const state = run([
      { event: 'user-message', data: { content: 't1' } },
      { event: 'todo-list', data: { items: [item1] } },
      { event: 'token', data: { delta: 'a' } },
      { event: 'done', data: {} },
      { event: 'user-message', data: { content: 't2' } },
      { event: 'todo-list', data: { items: [item1, item2] } },
    ]);
    const turnOneBubble = state.main.messages[1];
    expect(turnOneBubble.blocks?.some((b) => b.type === 'todo') ?? false).toBe(false);
    const turnTwoBubble = state.main.messages[3];
    const cards = turnTwoBubble.blocks?.filter((b) => b.type === 'todo');
    expect(cards).toHaveLength(1);
    expect(cards![0].status).toBe('streaming'); // turn two is live
    expect(cards![0].metadata?.items).toHaveLength(2);
    expect(allTodoCards(state)).toHaveLength(1);
  });

  it('a late post-done snapshot moves the card completed to the last assistant', () => {
    const state = run([
      { event: 'user-message', data: { content: 't1' } },
      { event: 'todo-list', data: { items: [item1] } },
      { event: 'done', data: {} },
      { event: 'user-message', data: { content: 't2' } },
      { event: 'token', data: { delta: 'b' } },
      { event: 'done', data: {} },
      { event: 'todo-list', data: { items: [item1, item2] } },
    ]);
    const lastAssistant = state.main.messages[state.main.messages.length - 1];
    const card = lastAssistant.blocks?.find((b) => b.type === 'todo');
    expect(card?.status).toBe('completed');
    expect(card?.metadata?.items).toHaveLength(2);
    expect(allTodoCards(state)).toHaveLength(1);
  });

  it('same-turn updates stay in place (no move, no churn)', () => {
    const state = run([
      { event: 'user-message', data: { content: 't1' } },
      { event: 'todo-list', data: { items: [item1] } },
      { event: 'token', data: { delta: 'a' } },
      { event: 'todo-list', data: { items: [item1, item2] } },
    ]);
    const bubble = state.main.messages[1];
    const cards = bubble.blocks?.filter((b) => b.type === 'todo');
    expect(cards).toHaveLength(1);
    expect(cards![0].metadata?.items).toHaveLength(2);
  });

  it('in-place update works when a system marker trails the bubble (host is last assistant, not last message)', () => {
    const state = run([
      { event: 'user-message', data: { content: 't1' } },
      { event: 'todo-list', data: { items: [item1] } },
      // Auto-compaction marker lands mid-turn, AFTER the bubble:
      { event: 'system-message', data: { content: 'compacted' } },
      { event: 'todo-list', data: { items: [item1, item2] } },
    ]);
    // Card updated in place on the bubble — never moved onto the marker row
    const bubble = state.main.messages[1];
    expect(bubble.role).toBe('assistant');
    const card = bubble.blocks?.find((b) => b.type === 'todo');
    expect(card?.metadata?.items).toHaveLength(2);
    expect(state.main.messages[2].role).toBe('system');
    expect(state.main.messages[2].blocks ?? []).toHaveLength(0);
  });

  it('resume anchors at the same place: last assistant message', () => {
    const rows: ColtsMessageInput[] = [
      { role: 'user', content: 't1', timestamp: 1 },
      { role: 'assistant', type: 'action', content: 'a', timestamp: 2 },
      { role: 'user', content: 't2', timestamp: 3 },
      { role: 'assistant', type: 'action', content: 'b', timestamp: 4 },
    ];
    const state = fromHistory(rows, { todoList: { items: [item1, item2] } });
    const lastAssistant = state.main.messages[state.main.messages.length - 1];
    const card = lastAssistant.blocks?.[lastAssistant.blocks.length - 1];
    expect(card?.type).toBe('todo');
    expect(card?.status).toBe('completed');
    // and nowhere else
    const total = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .filter((b) => b.type === 'todo');
    expect(total).toHaveLength(1);
  });
});
