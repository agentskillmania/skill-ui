import { describe, it, expect } from 'vitest';
import {
  selectMainMessages,
  selectTotalTokens,
  selectStepCount,
  selectTodoList,
  selectLastInputTokens,
} from '../../../src/core/conversation/selectors.js';
import { createEmptySessionState } from '../../../src/core/conversation/types.js';
import type { SessionRunState, SubAgentRunState } from '../../../src/core/conversation/types.js';

function makeState(overrides?: Partial<SessionRunState>): SessionRunState {
  const state = createEmptySessionState();
  if (overrides) Object.assign(state, overrides);
  return state;
}

function makeSubAgent(id: string, overrides?: Partial<SubAgentRunState>): SubAgentRunState {
  return {
    name: id,
    task: 'do stuff',
    parentBlockId: 'block-1',
    status: 'idle',
    stepCount: 0,
    tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    duration: 0,
    messages: [],
    activeSkill: null,
    ...overrides,
  };
}

describe('conversation selectors', () => {
  describe('selectMainMessages', () => {
    it('returns main agent messages', () => {
      const state = makeState();
      state.main.messages.push({ id: 'm1', role: 'user', content: 'hi', status: 'completed' });
      const msgs = selectMainMessages(state);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toBe('hi');
    });

    it('returns empty array when no messages', () => {
      expect(selectMainMessages(makeState())).toEqual([]);
    });
  });

  describe('selectTotalTokens', () => {
    it('sums main + sub-agent tokens', () => {
      const state = makeState({
        subAgents: new Map([
          [
            'sub-1',
            makeSubAgent('sub-1', {
              tokens: { input: 100, output: 50, cacheRead: 10, cacheWrite: 5 },
            }),
          ],
          [
            'sub-2',
            makeSubAgent('sub-2', {
              tokens: { input: 200, output: 100, cacheRead: 20, cacheWrite: 10 },
            }),
          ],
        ]),
      });
      state.main.tokens = { input: 50, output: 25, cacheRead: 5, cacheWrite: 2 };
      const totals = selectTotalTokens(state);
      expect(totals.input).toBe(350);
      expect(totals.output).toBe(175);
      expect(totals.cacheRead).toBe(35);
      expect(totals.cacheWrite).toBe(17);
    });

    it('returns main tokens only when no sub-agents', () => {
      const state = makeState();
      state.main.tokens = { input: 10, output: 5, cacheRead: 1, cacheWrite: 0 };
      const totals = selectTotalTokens(state);
      expect(totals.input).toBe(10);
      expect(totals.output).toBe(5);
    });
  });

  describe('selectStepCount', () => {
    it('returns main step count', () => {
      const state = makeState();
      state.main.stepCount = 42;
      expect(selectStepCount(state)).toBe(42);
    });
  });

  describe('selectTodoList', () => {
    it('returns the latest todo snapshot', () => {
      const state = makeState();
      state.main.todoList = {
        items: [{ id: 1, subject: 'a', status: 'in_progress' }],
      };
      expect(selectTodoList(state)?.items).toHaveLength(1);
    });

    it('returns undefined before the first todo-list event', () => {
      expect(selectTodoList(makeState())).toBeUndefined();
    });
  });

  describe('selectLastInputTokens', () => {
    it('returns the last LLM call input size', () => {
      const state = makeState();
      state.main.lastInputTokens = 12_000;
      expect(selectLastInputTokens(state)).toBe(12_000);
    });

    it('returns undefined before the first llm-response', () => {
      expect(selectLastInputTokens(makeState())).toBeUndefined();
    });
  });
});
