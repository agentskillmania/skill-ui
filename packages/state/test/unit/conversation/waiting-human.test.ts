/**
 * HITL 中断终态(wrangler-daemon done{type:"waiting_human"})的前端语义:
 * - waiting 的 done 保留 pending human_input 块(待答交互入口不关);
 * - run-resumed(宿主合成,/respond 续流前注入)重开轮次,续流 token 不丢;
 * - fromHistory + interrupts 重建 pending 问答块(刷新/重启后待答问题重现)。
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

/** 标准的"问到一半被 done{waiting_human} 收流"序列。 */
function waitingTurn() {
  return run([
    s('user-message', { content: 'help me' }),
    s('token', { delta: 'I need to ask you something.' }),
    s('human-input', {
      requestId: 'human-1',
      questions: [{ id: 'q1', question: 'Which?', type: 'single-select', options: ['A', 'B'] }],
    }),
    s('done', { type: 'waiting_human', totalSteps: 1 }),
  ]);
}

describe('done{waiting_human} keeps pending human_input blocks', () => {
  it('pending block survives the waiting done', () => {
    const state = waitingTurn();
    const last = state.main.messages[state.main.messages.length - 1];
    const block = last.blocks?.find((b) => b.type === 'human_input');
    expect(block).toBeDefined();
    expect(block?.status).toBe('pending');
    // run 本身照常收尾:idle + 终态闩扣上。
    expect(state.main.status).toBe('idle');
    expect(state.main.turnClosed).toBe(true);
  });

  it('streaming text/tool blocks still close on the waiting done', () => {
    const state = waitingTurn();
    const last = state.main.messages[state.main.messages.length - 1];
    const text = last.blocks?.find((b) => b.type === 'text');
    expect(text?.status).toBe('completed');
    expect(last.status).toBe('completed');
  });

  it('a normal done still closes pending human_input blocks', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('human-input', {
        requestId: 'human-2',
        questions: [{ id: 'q', question: '?', type: 'text' }],
      }),
      s('done', { type: 'success' }),
    ]);
    const last = state.main.messages[state.main.messages.length - 1];
    const block = last.blocks?.find((b) => b.type === 'human_input');
    // 一旦 run 真正结束,还开着的交互输入无人消费 —— 必须关闭(原语义保留)。
    expect(block?.status).toBe('completed');
  });
});

describe('run-resumed reopens the turn for the /respond continuation stream', () => {
  it('re-opens the latch and streams tokens into a fresh assistant bubble', () => {
    const state = waitingTurn();
    const resumed = [
      s('human-input-resolved', { requestId: 'human-1', response: { q1: 'A' } }),
      s('run-resumed', {}),
      s('token', { delta: 'Thanks, ' }),
      s('token', { delta: 'proceeding.' }),
      s('done', { type: 'success' }),
    ].reduce(reducer, state);
    // resolved 翻转旧块。
    const answered = resumed.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'human_input');
    expect(answered?.status).toBe('completed');
    // 续流 token 不被终态闩吞掉:新的 assistant 气泡承接并最终 success。
    const last = resumed.main.messages[resumed.main.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect(last.content).toBe('Thanks, proceeding.');
    expect(resumed.main.status).toBe('idle');
    expect(resumed.main.turnClosed).toBe(true);
  });
});

describe('fromHistory derives pending human_input from unanswered ask_human rows', () => {
  it('ask_human without a paired tool result becomes a pending block', () => {
    const history: ColtsMessageInput[] = [
      { role: 'user', content: 'help me', timestamp: 1 },
      {
        role: 'assistant',
        content: 'One question first.',
        toolCalls: [
          {
            id: 'human-1',
            name: 'ask_human',
            arguments: { questions: [{ id: 'q1', question: 'Which?', type: 'text' }] },
          },
        ],
        timestamp: 2,
      },
    ];
    const state = fromHistory(history);
    const last = state.main.messages[state.main.messages.length - 1];
    expect(last.role).toBe('assistant');
    const block = last.blocks?.find((b) => b.type === 'human_input');
    expect(block?.status).toBe('pending');
    expect((block?.metadata as Record<string, unknown>)?.requestId).toBe('human-1');
  });

  it('answered ask_human (tool result present) stays completed', () => {
    const history: ColtsMessageInput[] = [
      { role: 'user', content: 'help me', timestamp: 1 },
      {
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'human-2', name: 'ask_human', arguments: { questions: [] } }],
        timestamp: 2,
      },
      { role: 'tool', toolCallId: 'human-2', content: '{"q1":"A"}', timestamp: 3 },
      { role: 'assistant', content: 'Done.', timestamp: 4 },
    ];
    const state = fromHistory(history);
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'human_input');
    expect(block?.status).toBe('completed');
  });
});

describe('respond-stream second question (full round-2 sequence)', () => {
  it('pending block survives the exact wire sequence incl. noise events', () => {
    // 与 wrangler-daemon 两轮 e2e 的 respond 流逐帧对齐(resolved → 续跑
    // 噪声帧 → tool-start → phase-change → step-end → human-input →
    // done{waiting_human} → todo-list),run-resumed 在消费流前注入。
    const afterRound1 = waitingTurn();
    const resumed = [
      s('human-input-resolved', { requestId: 'human-1', response: { q1: 'A' } }),
      s('run-resumed', {}),
      s('phase-change', { from: { type: 'idle' }, to: { type: 'preparing' } }),
      s('llm-request', { messages: [], tools: [], skill: null, model: 'm', contextWindow: 128000 }),
      s('thinking', { content: 'round two thinking' }),
      s('llm-response', { text: '', toolCalls: [], tokens: { input: 10 } }),
      s('phase-change', { from: { type: 'parsing' }, to: { type: 'parsed' } }),
      s('tool-start', { id: 'call-2', name: 'ask_human', args: { questions: [] } }),
      s('phase-change', { from: { type: 'executing-tool' }, to: { type: 'waiting-human' } }),
      s('step-end', { step: 0, type: 'waiting-human', duration: 8, tokens: {} }),
      s('human-input', {
        requestId: 'call-2',
        questions: [{ id: 'q2', question: 'second?', type: 'text' }],
        context: null,
      }),
      s('done', { type: 'waiting_human', totalSteps: 1, duration: 8, tokens: {} }),
      s('todo-list', { items: [] }),
    ].reduce(reducer, afterRound1);

    const blocks = resumed.main.messages.flatMap((m) => m.blocks ?? []);
    const pendingQ = blocks.filter((b) => b.type === 'human_input' && b.status === 'pending');
    expect(pendingQ).toHaveLength(1);
    expect((pendingQ[0].metadata as Record<string, unknown>)?.requestId).toBe('call-2');
    // round-1 的块已答,round-2 的工具块先于问题块(blocks 顺序即渲染顺序)。
    const idxTool = blocks.findIndex((b) => b.type === 'tool_call');
    const idxPending = blocks.findIndex(
      (b) => b.type === 'human_input' && b.status === 'pending' && b.id === 'call-2'
    );
    expect(idxTool).toBeGreaterThan(0);
    expect(idxPending).toBeGreaterThan(idxTool);
    expect(resumed.main.status).toBe('idle');
    expect(resumed.main.turnClosed).toBe(true);
  });
});
