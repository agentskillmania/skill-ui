/**
 * @fileoverview 异步委派/多轮流 —— done 后 step-start 重开 + delivery 投递。
 *
 * 事件流常驻(后端会话级事件流)时,一条流上会有多轮:用户轮 done 之后,
 * 后续轮没有用户消息开路,直接以 step-start 开始。旧逻辑会把这类帧全部
 * 丢弃(异步委派的主回答从此不可见);现在 done 后的 step-start 按
 * run-resumed 相同语义重开轮次。
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

describe('多轮流 —— done 后 step-start 重开轮次', () => {
  it('done 后的 step-start 重开一轮:新气泡、帧不再被丢弃', () => {
    const state = run([
      s('user-message', { content: '派活' }),
      s('token', { delta: '已派出' }),
      s('done', { type: 'success' }),
      // 后续轮开始(没有用户消息):
      s('step-start', { step: 0 }),
      s('token', { delta: '消化结果' }),
      s('done', { type: 'success' }),
    ]);
    // user + 两个 assistant 气泡:第一轮与重开的后续轮。
    expect(state.main.messages).toHaveLength(3);
    expect(state.main.messages[0].role).toBe('user');
    expect(state.main.messages[1].status).toBe('completed');
    expect(state.main.messages[2].status).toBe('completed');
    expect(state.main.messages[2].content).toContain('消化结果');
    expect(state.main.turnClosed).toBe(true);
  });

  it('没有 step-start 的迟到 token 仍然被丢弃(不再重开)', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('done', { type: 'success' }),
      s('token', { delta: 'zombie' }),
    ]);
    // user + 第一轮 assistant;迟到的 token 没有开新气泡也没进旧气泡。
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

  it('判据:step>0 的迟到 step-start 不重开(流 FIFO,新轮首步必为 0)', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('token', { delta: 'answer' }),
      s('done', { type: 'success' }),
      s('step-start', { step: 1 }),
      s('token', { delta: 'zombie' }),
    ]);
    // 旧轮的迟到 step-start(1) 不重开;后续 token 被丢弃(轮次已结束)。
    expect(state.main.messages).toHaveLength(2);
    expect(state.main.messages[1].content).not.toContain('zombie');
    expect(state.main.turnClosed).toBe(true);
  });

  it('重开延迟到首个内容帧:step-start(0) 不预建气泡,空轮不留空壳', () => {
    const emptyTurn = run([
      s('user-message', { content: 'hi' }),
      s('token', { delta: 'answer' }),
      s('done', { type: 'success' }),
      // 空后续轮:step-start(0) 后直接 done,没有任何内容帧。
      s('step-start', { step: 0 }),
      s('done', { type: 'success' }),
    ]);
    // user + 第一轮 assistant——空轮没有留下空气泡。
    expect(emptyTurn.main.messages).toHaveLength(2);
    expect(emptyTurn.main.turnClosed).toBe(true);

    const contentTurn = run([
      s('user-message', { content: 'hi' }),
      s('done', { type: 'success' }),
      s('step-start', { step: 0 }),
      s('token', { delta: 'consumed' }),
      s('done', { type: 'success' }),
    ]);
    expect(contentTurn.main.messages).toHaveLength(3);
    expect(contentTurn.main.messages[2].content).toContain('consumed');
  });

  it('done 后到达的 subagent-start 不再被丢弃(等待并发限制的子会话在主轮结束后才开跑)', () => {
    const state = run([
      s('user-message', { content: '派活' }),
      s('done', { type: 'success' }),
      // 主轮已结束,子会话此刻才开跑:
      s('subagent-start', { subtaskId: 'late-1', name: 'scout', task: '慢侦查' }),
      s('subagent-end', { subtaskId: 'late-1', status: 'success', totalSteps: 1 }),
      s('delivery', { subtaskId: 'late-1', agent: 'scout', status: 'success', content: '结果' }),
    ]);
    // 子运行登记在册(此前会被丢弃,后续帧也全部静默丢失)。
    const sub = state.subAgents.get('late-1');
    expect(sub).toBeDefined();
    expect(sub?.delivered).toBe(true);
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'subagent' && b.metadata?.subtaskId === 'late-1');
    expect(block).toBeDefined();
    expect(block?.metadata?.delivered).toBe(true);
  });
});

describe('delivery —— 异步委派投递', () => {
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

  it('重复 delivery last-wins(投递幂等,后到的状态覆盖)', () => {
    const state = run([
      s('user-message', { content: '派活' }),
      s('subagent-start', { subtaskId: 'scout-2', name: 'scout', task: 't' }),
      s('subagent-end', { subtaskId: 'scout-2', status: 'success', totalSteps: 1 }),
      s('done', { type: 'success' }),
      s('delivery', { subtaskId: 'scout-2', agent: 'scout', status: 'success', content: '第一次' }),
      s('delivery', { subtaskId: 'scout-2', agent: 'scout', status: 'error', content: '第二次' }),
    ]);
    const sub = state.subAgents.get('scout-2');
    expect(sub?.deliveryStatus).toBe('error');
    expect(sub?.deliveryContent).toBe('第二次');
  });

  it('delivery 先于 subagent-end 到达:已送达与运行中并存,顺序无关', () => {
    const state = run([
      s('user-message', { content: '派活' }),
      s('subagent-start', { subtaskId: 'scout-3', name: 'scout', task: 't' }),
      s('delivery', { subtaskId: 'scout-3', agent: 'scout', status: 'success', content: '早到' }),
      s('subagent-end', { subtaskId: 'scout-3', status: 'success', totalSteps: 1 }),
    ]);
    const sub = state.subAgents.get('scout-3');
    expect(sub?.delivered).toBe(true);
    expect(sub?.turnClosed).toBe(true, 'end 在 delivery 之后照常关闭轮次');
  });

  it('连续两个后续轮(两次重开)互不串扰', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('done', { type: 'success' }),
      s('step-start', { step: 0 }),
      s('token', { delta: '第一消化' }),
      s('done', { type: 'success' }),
      s('step-start', { step: 0 }),
      s('token', { delta: '第二消化' }),
      s('done', { type: 'success' }),
    ]);
    // user + 三个 assistant(原轮 + 两个后续轮)。
    expect(state.main.messages).toHaveLength(4);
    expect(state.main.messages[2].content).toContain('第一消化');
    expect(state.main.messages[3].content).toContain('第二消化');
    expect(state.main.messages[3].status).toBe('completed');
  });
});

describe('fromHistory —— 异步受理与投递标记的持久重建', () => {
  it('accepted 受理用真实 subtaskId 建子运行,投递标记回填 delivered', async () => {
    const { fromHistory } = await import('../../../src/core/conversation/fromHistory.js');
    const history = [
      { role: 'user' as const, content: '派 scout', timestamp: 1 },
      {
        role: 'assistant' as const,
        content: '',
        toolCalls: [
          {
            id: 'call-1',
            name: 'delegate',
            arguments: { agent: 'scout', task: '侦查' },
          },
        ],
        timestamp: 2,
      },
      {
        role: 'tool' as const,
        toolCallId: 'call-1',
        content: JSON.stringify({
          status: 'accepted',
          subtaskId: 'scout-1726000000000-7',
          agent: 'scout',
          task: '侦查',
          message: 'Sub-task accepted and running in the background.',
        }),
        timestamp: 3,
      },
      // 后续轮 user 消息里的投递标记(与后端的 format_deliveries 格式一致):
      {
        role: 'user' as const,
        content:
          'The following are results from sub-tasks you delegated earlier:\n\n<delivery agent="scout" subtaskId="scout-1726000000000-7" status="success">\n发现-AGT-8842\n</delivery>\n',
        timestamp: 4,
      },
      { role: 'assistant' as const, content: '收到并消化完毕', timestamp: 5 },
    ];
    const state = fromHistory(history);
    // 真实 subtaskId 做键(此前 hist- 前缀永不匹配 live 帧)。
    const sub = state.subAgents.get('scout-1726000000000-7');
    expect(sub).toBeDefined();
    expect(sub?.delivered).toBe(true);
    expect(sub?.deliveryStatus).toBe('success');
    expect(sub?.deliveryContent).toBe('发现-AGT-8842');
    const block = state.main.messages
      .flatMap((m) => m.blocks ?? [])
      .find((b) => b.type === 'subagent' && b.metadata?.subtaskId === 'scout-1726000000000-7');
    expect(block?.metadata?.delivered).toBe(true);
  });

  it('未投递的 accepted 受理:子运行在册但 delivered 为空(异步进行中)', async () => {
    const { fromHistory } = await import('../../../src/core/conversation/fromHistory.js');
    const history = [
      { role: 'user' as const, content: '派 scout', timestamp: 1 },
      {
        role: 'assistant' as const,
        content: '',
        toolCalls: [{ id: 'call-2', name: 'delegate', arguments: { agent: 'scout', task: 'x' } }],
        timestamp: 2,
      },
      {
        role: 'tool' as const,
        toolCallId: 'call-2',
        content: JSON.stringify({ status: 'accepted', subtaskId: 'scout-pending-1' }),
        timestamp: 3,
      },
      { role: 'assistant' as const, content: '已派出', timestamp: 4 },
    ];
    const state = fromHistory(history);
    const sub = state.subAgents.get('scout-pending-1');
    expect(sub).toBeDefined('accepted 受理必须登记子运行');
    expect(sub?.delivered).toBeUndefined();
  });
});
