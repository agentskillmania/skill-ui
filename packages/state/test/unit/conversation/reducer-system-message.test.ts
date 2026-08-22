/**
 * system-message 事件 —— 宿主合成的居中标记行(压缩/换模型等)。
 *
 * 契约:append 一条 role:'system' 的完成态消息;与 user-message 的关键
 * 差异是不预建 streaming assistant(标记不是回合开场白);content/timestamp
 * 缺省走 fallback;事件日志条目带宿主提供的 label。
 */
import { describe, it, expect } from 'vitest';
import { reducer } from '../../../src/core/conversation/reducer.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

function s(event: string, data: Record<string, unknown>): SSEEvent {
  return { event, data };
}

function run(events: SSEEvent[]) {
  return events.reduce(reducer, createEmptySessionState());
}

describe('reducer — system-message', () => {
  it('appends a completed system message with content and timestamp', () => {
    const state = run([s('system-message', { content: '上下文已压缩', timestamp: 1700000000000 })]);
    expect(state.main.messages).toHaveLength(1);
    const msg = state.main.messages[0];
    expect(msg.role).toBe('system');
    expect(msg.status).toBe('completed');
    expect(msg.content).toBe('上下文已压缩');
    expect(msg.createdAt).toBe(1700000000000);
    expect(msg.id).toMatch(/^sys-/);
  });

  it('does NOT pre-create a streaming assistant message (unlike user-message)', () => {
    const state = run([s('system-message', { content: 'model switched' })]);
    // 只有标记行本身 —— 没有 user-message 那样的 pending assistant。
    expect(state.main.messages).toHaveLength(1);
    expect(state.main.messages[0].role).toBe('system');
  });

  it('falls back to empty content and now() when fields are missing', () => {
    const before = Date.now();
    const state = run([s('system-message', {})]);
    const msg = state.main.messages[0];
    expect(msg.content).toBe('');
    expect(msg.createdAt).toBeGreaterThanOrEqual(before);
  });

  it('lands chronologically: tokens after a marker open a NEW assistant bubble', () => {
    // 自动压缩发生在 step 之间 —— 标记后到达的 token 不得并入之前的
    // streaming 气泡,也不得并进标记行(它是完成态、非 assistant)。
    const state = run([
      s('token', { delta: 'before' }),
      s('system-message', { content: 'compacted' }),
      s('token', { delta: 'after' }),
    ]);
    const roles = state.main.messages.map((m) => m.role);
    expect(roles).toEqual(['assistant', 'system', 'assistant']);
    // 后一段 token 进了新的 assistant 气泡,标记行内容未被污染。
    expect(state.main.messages[1].content).toBe('compacted');
    expect(state.main.messages[2].content).toBe('after');
    // 前一气泡仍是 streaming(done 未到)。
    expect(state.main.messages[0].status).toBe('streaming');
  });

  it('is preserved by fromHistory system rows in the event log with host label', () => {
    const state = run([s('system-message', { content: 'x', label: 'Model switched' })]);
    const entry = state.events[state.events.length - 1];
    expect(entry.type).toBe('system-message');
    expect(entry.label).toBe('Model switched');
    expect(entry.category).toBe('lifecycle');
  });

  it('defaults the event-log label to "System" when the host provides none', () => {
    const state = run([s('system-message', { content: 'x' })]);
    const entry = state.events[state.events.length - 1];
    expect(entry.label).toBe('System');
  });
});
