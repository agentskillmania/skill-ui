/**
 * @fileoverview Turn lifecycle — status wiring + the terminal guard.
 *
 * Two explicit signals replaced the old "inspect the last message's shape"
 * heuristic (0.4.3's turnLive), which existed because run status was never
 * wired for the main agent:
 *
 * - `status` ('idle'|'streaming'|'error') is now real for main too:
 *   user-message and the first content event open a turn (streaming),
 *   done/error close it, session-cleared resets.
 * - `turnClosed` is the terminal latch — event history, not state shape.
 *   While latched, ensureStreamingMessage refuses to open a stream and every
 *   content handler drops its frame: a late frame after done/error must never
 *   revive the run as an eternal streaming bubble.
 *
 * The loadHistory-mid-run race (sim_split) is the load-bearing constraint:
 * a fromHistory-rebuilt state is message-shape-identical to a post-done
 * state, yet must stay open-able — hence "closed" is recorded, not derived.
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import type { SessionRunState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function s(event: string, data: Record<string, unknown> = {}): SSEEvent {
  return { event, data };
}

function run(events: SSEEvent[]): SessionRunState {
  return events.reduce(reducer, createEmptySessionState());
}

describe('turn lifecycle — status wiring (main)', () => {
  it('starts idle, opens on user-message, closes on done', () => {
    let state = run([s('user-message', { content: 'hi' })]);
    expect(state.main.status).toBe('streaming');
    expect(state.main.turnClosed).toBe(false);

    state = run([s('user-message', { content: 'hi' }), s('done', {})]);
    expect(state.main.status).toBe('idle');
    expect(state.main.turnClosed).toBe(true);
  });

  it('first bare content event opens a turn (resilience path stays intact)', () => {
    const state = run([s('token', { delta: 'x' })]);
    expect(state.main.status).toBe('streaming');
    expect(state.main.messages).toHaveLength(1);
  });

  it('error sets status error and latches the turn closed', () => {
    const state = run([s('user-message', { content: 'hi' }), s('error', { message: 'boom' })]);
    expect(state.main.status).toBe('error');
    expect(state.main.turnClosed).toBe(true);
  });

  it('session-cleared resets both status and the latch', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('done', {}),
      s('session-cleared', {}),
    ]);
    expect(state.main.status).toBe('idle');
    expect(state.main.turnClosed).toBe(false);
  });
});

describe('turn lifecycle — terminal guard (late frames dropped)', () => {
  const closedTurn = [
    s('user-message', { content: 'hi' }),
    s('token', { delta: 'answer' }),
    s('done', {}),
  ];

  it('late token after done does not open a zombie bubble', () => {
    const state = run([...closedTurn, s('token', { delta: 'late' })]);
    const msgs = state.main.messages;
    expect(msgs).toHaveLength(2); // user + assistant, no third bubble
    expect(msgs[1].content).toBe('answer'); // unchanged
    expect(msgs.every((m) => m.status === 'completed')).toBe(true);
  });

  it('late thinking after done is dropped', () => {
    const state = run([...closedTurn, s('thinking', { content: 'late thought' })]);
    expect(state.main.messages).toHaveLength(2);
    expect(
      state.main.messages.flatMap((m) => m.blocks ?? []).every((b) => b.status === 'completed')
    ).toBe(true);
  });

  it('late tool-start after done is dropped', () => {
    const state = run([...closedTurn, s('tool-start', { id: 'c1', name: 'shell', args: {} })]);
    expect(
      state.main.messages.flatMap((m) => m.blocks ?? []).some((b) => b.type === 'tool_call')
    ).toBe(false);
  });

  it('late human-input after done is dropped (no forever-pending block)', () => {
    const state = run([
      ...closedTurn,
      s('human-input', { requestId: 'r1', questions: [{ question: 'q', type: 'text' }] }),
    ]);
    expect(
      state.main.messages.flatMap((m) => m.blocks ?? []).some((b) => b.type === 'human_input')
    ).toBe(false);
  });

  it('late subagent-start after done registers in a reopened background turn (queued children)', () => {
    // 契约变更:排队的子女(等并发闸门)可能在主轮 done 之后才起飞——
    // subagent-start 与 delivery 同等会话级路由,不再整帧丢弃;主轮已闩
    // 则惰性重开一个后台轮容器挂载子块。真迟到的旧轮帧(token 等)
    // 仍被闩挡住(见前后用例)。
    const state = run([
      ...closedTurn,
      s('subagent-start', { subtaskId: 'sub-1', name: 'ghost', task: 't' }),
    ]);
    expect(state.subAgents.size).toBe(1);
    expect(state.main.turnClosed).toBe(false, 'background turn reopened');
    expect(
      state.main.messages.flatMap((m) => m.blocks ?? []).some((b) => b.type === 'subagent')
    ).toBe(true);
  });

  it('late token after error is dropped', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('error', {}),
      s('token', { delta: 'late' }),
    ]);
    expect(state.main.messages).toHaveLength(2);
    expect(state.main.messages[1].content).toBe('');
    expect(state.main.messages[1].status).toBe('error');
  });

  it('thinking after a bare done (no messages at all) stays dropped', () => {
    const state = run([s('done', {}), s('thinking', { content: 'x' }), s('token', { delta: 'y' })]);
    expect(state.main.messages).toHaveLength(0);
  });
});

describe('turn lifecycle — reopening', () => {
  it('a new user-message re-opens the turn after done', () => {
    const state = run([
      s('user-message', { content: 'first' }),
      s('token', { delta: 'a' }),
      s('done', {}),
      s('user-message', { content: 'second' }),
      s('token', { delta: 'b' }),
    ]);
    const msgs = state.main.messages;
    expect(msgs).toHaveLength(4); // user, assistant, user, assistant
    expect(msgs[3].role).toBe('assistant');
    expect(msgs[3].status).toBe('streaming');
    expect(msgs[3].content).toBe('b');
    expect(state.main.status).toBe('streaming');
  });

  it('session-cleared unlatches: the command echo token opens a fresh bubble', () => {
    const state = run([
      s('user-message', { content: 'hi' }),
      s('token', { delta: 'work' }),
      s('done', {}),
      s('session-cleared', {}),
      s('token', { delta: 'Session cleared.' }),
    ]);
    expect(state.main.messages).toHaveLength(1);
    expect(state.main.messages[0].content).toBe('Session cleared.');
    expect(state.main.messages[0].status).toBe('streaming');
  });
});

describe('turn lifecycle — loadHistory race constraint', () => {
  it('a fromHistory-rebuilt state (turnClosed=false) lets the live tail reopen a bubble', () => {
    // The reducer never consumed a terminal event on this instance — the
    // rebuilt state must behave like a resting-but-open one, or the tail of
    // an in-flight run would be dropped after a mid-run history load.
    const rebuilt = fromHistory([{ role: 'user', content: 'hi', timestamp: 1 }]);
    expect(rebuilt.main.turnClosed).toBe(false);

    const state = reducer(rebuilt, s('token', { delta: 'tail' }));
    expect(state.main.messages).toHaveLength(2);
    expect(state.main.messages[1].status).toBe('streaming');
    expect(state.main.messages[1].content).toBe('tail');
  });
});

describe('turn lifecycle — sub-agent terminal guard', () => {
  it('subagent-end latches the sub-run; late sub frames are dropped', () => {
    const state = run([
      s('user-message', { content: 'go' }),
      s('subagent-start', { subtaskId: 'sub-1', name: 'helper', task: 't' }),
      s('subagent-token', { subtaskId: 'sub-1', delta: 'partial' }),
      s('subagent-end', { subtaskId: 'sub-1', status: 'success' }),
      // Late frames riding another channel after the sub finished:
      s('subagent-token', { subtaskId: 'sub-1', delta: 'ZOMBIE' }),
      s('subagent-thinking', { subtaskId: 'sub-1', content: 'ZOMBIE' }),
      s('subagent-tool-start', { subtaskId: 'sub-1', action: { id: 'c9', tool: 'shell' } }),
    ]);
    const sub = state.subAgents.get('sub-1')!;
    expect(sub.turnClosed).toBe(true);
    expect(sub.messages).toHaveLength(1);
    expect(sub.messages[0].content).toBe('partial');
    expect(sub.messages[0].status).toBe('completed');
    expect(sub.messages[0].blocks?.every((b) => b.status === 'completed') ?? true).toBe(true);
  });
});
