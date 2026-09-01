/**
 * @fileoverview 异步委派/多轮流 —— step-start-after-done 重开 + delivery 回执。
 *
 * events 常驻接口(wrangler daemon 的会话级事件流)下,一条流上会有
 * 多轮:用户轮 done 之后,消费轮/后台轮没有用户消息开路,直接以
 * step-start 开始。旧终态闩会把这些帧全部丢弃(异步委派的主回答从此
 * 不可见);现在 step-start-after-done 按 run-resumed 同款语义重开轮次。
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function s(event: string, data: Record<string, unknown> = {}): SSEEvent {
  return { event, data };
}

function run(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

describe('多轮流 —— step-start-after-done 重开轮次', () => {
  it('done 后的 step-start 重开一轮:新气泡、帧不再被丢弃', () => {
    const state = run([
      s('user-message', { content: '派活' }),
      s('token', { delta: '已派出' }),
      s('done', { type: 'success' }),
      // 消费轮开始(没有用户消息):
      s('step-start', { step: 0 }),
      s('token', { delta: '消化结果' }),
      s('done', { type: 'success' }),
    ]);
    // user + 两个 assistant 气泡:第一轮与重开的消费轮。
    expect(state.main.messages).toHaveLength(3);
    expect(state.main.messages[0].role).toBe('user');
    expect(state.main.messages[1].status).toBe('completed');
    expect(state.main.messages[2].status).toBe('completed');
    expect(state.main.messages[2].content).toContain('消化结果');
    expect(state.main.turnClosed).toBe(true);
  });

  it('没有 step-start 的迟到 token 仍然被丢弃(终态闩不松动)', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('done', { type: 'success' }),
      s('token', { delta: 'zombie' }),
    ]);
    // user + 第一轮 assistant;zombie token 没有开新气泡也没进旧气泡。
    expect(state.main.messages).toHaveLength(2);
    expect(state.main.messages[1].content).not.toContain('zombie');
  });

  it('重开轮次的用量独立累计(不被上一轮污染)', () => {
    const state = run([
      s('user-message', { content: 'a' }),
      s('step-end', { tokens: { input: 10, output: 5 }, duration: 100 }),
      s('done', { type: 'success', tokens: { input: 10, output: 5 }, duration: 100 }),
      s('step-start', { step: 0 }),
      s('step-end', { tokens: { input: 2, output: 1 }, duration: 20 }),
      s('done', { type: 'success' }),
    ]);
    expect(state.main.turnTokens.input).toBe(2);
    expect(state.main.turnDurationMs).toBe(20);
  });
});

describe('delivery —— 异步委派投递回执', () => {
  it('delivery 给子运行与父块都打"已送达"标记', () => {
    const state = run([
      s('user-message', { content: '派 scout' }),
      s('subagent-start', { subtaskId: 'scout-1', name: 'scout', task: '侦查' }),
      s('subagent-end', { subtaskId: 'scout-1', status: 'success', totalSteps: 1 }),
      s('done', { type: 'success' }),
      s('delivery', {
        subtaskId: 'scout-1',
        agent: 'scout',
        status: 'success',
        content: '发现-AGT',
      }),
    ]);
    const sub = state.subAgents.get('scout-1');
    expect(sub?.delivered).toBe(true);
    expect(sub?.deliveryStatus).toBe('success');
    expect(sub?.deliveryContent).toBe('发现-AGT');
    const parentBlock = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'subagent' && b.metadata?.subtaskId === 'scout-1');
    expect(parentBlock?.metadata?.delivered).toBe(true);
  });

  it('未知 subtaskId 的 delivery 是 no-op', () => {
    const before = run([s('user-message', { content: 'hi' })]);
    const after = reducer(
      before,
      s('delivery', { subtaskId: 'ghost', agent: 'x', status: 'success' })
    );
    expect(after).toBe(before);
  });
});
