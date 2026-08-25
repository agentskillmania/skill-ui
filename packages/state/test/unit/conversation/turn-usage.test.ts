/**
 * @fileoverview Per-turn usage tests — reducer stamping + fromHistory restore.
 *
 * The turn's usage is stamped on the turn's final assistant message:
 * - done carries authoritative turn totals (tokens + duration);
 * - aborted done / error fall back to the step-end delta accumulators;
 * - user-message and session-cleared reset the accumulators so turns
 *   never bleed into each other (incl. across a HITL pause+resume).
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { fromHistory } from '../../../src/core/conversation/fromHistory.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SessionRunState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function pushEvents(
  events: SSEEvent[],
  from: SessionRunState = createEmptySessionState()
): SessionRunState {
  return events.reduce(reducer, from);
}

function lastAssistant(state: SessionRunState) {
  const msg = [...state.main.messages].reverse().find((m) => m.role === 'assistant');
  if (!msg) throw new Error('no assistant message');
  return msg;
}

const step1 = {
  event: 'step-end',
  data: { step: 1, tokens: { input: 500, output: 100 }, duration: 1200 },
};
const step2 = {
  event: 'step-end',
  data: { step: 2, tokens: { input: 300, output: 50 }, duration: 800 },
};

describe('turn usage — reducer', () => {
  it('stamps done payload totals onto the streaming assistant message', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'token', data: { delta: 'Answer' } },
      step1,
      {
        event: 'done',
        data: {
          totalSteps: 1,
          duration: 2000,
          tokens: { input: 800, output: 150, cache_read: 40, cache_write: 10 },
          type: 'success',
        },
      },
    ]);
    const msg = lastAssistant(state);
    expect(msg.status).toBe('completed');
    expect(msg.usage).toEqual({
      inputTokens: 800,
      outputTokens: 150,
      cacheReadTokens: 40,
      cacheWriteTokens: 10,
      durationMs: 2000,
    });
  });

  it('falls back to step-end deltas for an aborted done (no payload)', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      { event: 'token', data: { delta: 'partial' } },
      step1,
      step2,
      { event: 'done', data: { aborted: true } },
    ]);
    expect(lastAssistant(state).usage).toEqual({
      inputTokens: 800,
      outputTokens: 150,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      durationMs: 2000,
    });
  });

  it('stamps accumulated deltas on error turns', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      step1,
      { event: 'error', data: { message: 'boom' } },
    ]);
    expect(lastAssistant(state).usage).toEqual({
      inputTokens: 500,
      outputTokens: 100,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      durationMs: 1200,
    });
  });

  it('does not stamp usage when the turn consumed nothing (command echo)', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: '/clear' } },
      { event: 'token', data: { delta: 'Session cleared.' } },
      { event: 'done', data: { totalSteps: 0, duration: 0, tokens: {} } },
    ]);
    expect(lastAssistant(state).usage).toBeUndefined();
  });

  it('resets accumulators on user-message — turns never bleed', () => {
    // Turn 1 with usage, then turn 2 that errors before any step.
    const state = pushEvents([
      { event: 'user-message', data: { content: 'one' } },
      step1,
      { event: 'done', data: { duration: 1200, tokens: { input: 500, output: 100 } } },
      { event: 'user-message', data: { content: 'two' } },
      { event: 'error', data: { message: 'early fail' } },
    ]);
    const msgs = state.main.messages.filter((m) => m.role === 'assistant');
    expect(msgs[0].usage?.inputTokens).toBe(500);
    expect(msgs[1].usage).toBeUndefined();
  });

  it('accumulates across a HITL pause (no user-message in between)', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      step1,
      { event: 'human-input', data: { id: 'req-1', message: 'proceed?' } },
      { event: 'human-input-resolved', data: { requestId: 'req-1', response: 'yes' } },
      step2,
      { event: 'done', data: { duration: 2000, tokens: { input: 800, output: 150 } } },
    ]);
    // Authoritative done totals win; the resume path never split the turn.
    expect(lastAssistant(state).usage).toEqual({
      inputTokens: 800,
      outputTokens: 150,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      durationMs: 2000,
    });
  });

  it('resets accumulators on session-cleared', () => {
    const state = pushEvents([
      { event: 'user-message', data: { content: 'hi' } },
      step1,
      { event: 'session-cleared', data: {} },
      { event: 'user-message', data: { content: 'again' } },
      { event: 'error', data: { message: 'x' } },
    ]);
    expect(lastAssistant(state).usage).toBeUndefined();
  });
});

describe('turn usage — fromHistory', () => {
  it('restores usage from the turn-final assistant row', () => {
    const state = fromHistory([
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'thinking…', type: 'thought', timestamp: 1100 },
      {
        role: 'assistant',
        content: 'Answer',
        timestamp: 1200,
        usage: {
          inputTokens: 800,
          outputTokens: 150,
          cacheReadTokens: 40,
          cacheWriteTokens: 10,
          durationMs: 2000,
        },
      },
    ]);
    const msgs = state.main.messages.filter((m) => m.role === 'assistant');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].usage?.inputTokens).toBe(800);
    expect(msgs[0].usage?.durationMs).toBe(2000);
  });

  it('last row carrying usage wins when several rows have it', () => {
    const state = fromHistory([
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'partial',
        timestamp: 1100,
        usage: {
          inputTokens: 1,
          outputTokens: 1,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          durationMs: 5,
        },
      },
      {
        role: 'assistant',
        content: ' final',
        timestamp: 1200,
        usage: {
          inputTokens: 900,
          outputTokens: 200,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
          durationMs: 3000,
        },
      },
    ]);
    const msgs = state.main.messages.filter((m) => m.role === 'assistant');
    expect(msgs[0].usage?.inputTokens).toBe(900);
  });

  it('old archives without usage degrade to time-only (no usage field)', () => {
    const state = fromHistory([
      { role: 'user', content: 'hi', timestamp: 1000 },
      { role: 'assistant', content: 'Answer', timestamp: 1200 },
    ]);
    expect(state.main.messages.filter((m) => m.role === 'assistant')[0].usage).toBeUndefined();
  });

  it('normalizes the wrangler.rs wire shape (cacheRead/cacheWrite, no Tokens suffix)', () => {
    const state = fromHistory([
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'Answer',
        timestamp: 1200,
        // wrangler.rs TurnUsage 的 serde camelCase 原样:缓存字段无 Tokens 后缀。
        usage: {
          inputTokens: 800,
          outputTokens: 150,
          cacheRead: 40,
          cacheWrite: 10,
          durationMs: 2000,
        },
      },
    ]);
    const usage = state.main.messages.filter((m) => m.role === 'assistant')[0].usage;
    expect(usage).toEqual({
      inputTokens: 800,
      outputTokens: 150,
      cacheReadTokens: 40,
      cacheWriteTokens: 10,
      durationMs: 2000,
    });
  });

  it('bad values in a usage object fall to 0 instead of undefined', () => {
    const state = fromHistory([
      { role: 'user', content: 'hi', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'Answer',
        timestamp: 1200,
        usage: { inputTokens: 'many', cacheRead: null, durationMs: Number.NaN },
      },
    ]);
    const usage = state.main.messages.filter((m) => m.role === 'assistant')[0].usage;
    expect(usage).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      durationMs: 0,
    });
  });
});
