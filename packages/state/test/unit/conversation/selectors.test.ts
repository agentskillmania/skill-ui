import { describe, it, expect } from 'vitest';
import {
  selectMainMessages,
  selectSubAgent,
  selectSubAgentMessages,
  selectSubAgentMetrics,
  selectAllSubAgents,
  selectEvents,
  selectTotalTokens,
  selectStatus,
  selectStepCount,
  selectActiveSkill,
  selectTodoList,
  selectActivityTimeline,
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

  describe('selectSubAgent', () => {
    it('returns sub-agent by subtaskId', () => {
      const sub = makeSubAgent('sub-1');
      const state = makeState({ subAgents: new Map([['sub-1', sub]]) });
      expect(selectSubAgent(state, 'sub-1')).toBe(sub);
    });

    it('returns undefined for unknown subtaskId', () => {
      expect(selectSubAgent(makeState(), 'nope')).toBeUndefined();
    });
  });

  describe('selectSubAgentMessages', () => {
    it('returns sub-agent messages', () => {
      const sub = makeSubAgent('sub-1');
      sub.messages.push({ id: 'm1', role: 'assistant', content: 'answer', status: 'completed' });
      const state = makeState({ subAgents: new Map([['sub-1', sub]]) });
      expect(selectSubAgentMessages(state, 'sub-1')).toHaveLength(1);
    });

    it('returns empty array for unknown subtaskId', () => {
      expect(selectSubAgentMessages(makeState(), 'nope')).toEqual([]);
    });
  });

  describe('selectSubAgentMetrics', () => {
    it('returns metrics summary for existing sub-agent', () => {
      const sub = makeSubAgent('sub-1', {
        totalSteps: 5,
        tokens: { input: 100, output: 50, cacheRead: 10, cacheWrite: 5 },
        duration: 3000,
        status: 'streaming',
        resultStatus: 'success',
      });
      const state = makeState({ subAgents: new Map([['sub-1', sub]]) });
      const metrics = selectSubAgentMetrics(state, 'sub-1');
      expect(metrics.steps).toBe(5);
      expect(metrics.tokens?.input).toBe(100);
      expect(metrics.duration).toBe(3000);
      expect(metrics.status).toBe('streaming');
      expect(metrics.resultStatus).toBe('success');
    });

    it('returns empty object for unknown subtaskId', () => {
      expect(selectSubAgentMetrics(makeState(), 'nope')).toEqual({});
    });
  });

  describe('selectAllSubAgents', () => {
    it('returns all sub-agents as array', () => {
      const state = makeState({
        subAgents: new Map([
          ['sub-1', makeSubAgent('sub-1')],
          ['sub-2', makeSubAgent('sub-2')],
        ]),
      });
      const all = selectAllSubAgents(state);
      expect(all).toHaveLength(2);
    });

    it('returns empty array when no sub-agents', () => {
      expect(selectAllSubAgents(makeState())).toEqual([]);
    });
  });

  describe('selectEvents', () => {
    it('returns event log', () => {
      const state = makeState();
      state.events.push({
        id: 'e1',
        timestamp: 0,
        type: 'token',
        category: 'token',
        label: 'token',
      });
      expect(selectEvents(state)).toHaveLength(1);
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

  describe('selectStatus', () => {
    it('returns main status', () => {
      const state = makeState();
      state.main.status = 'streaming';
      expect(selectStatus(state)).toBe('streaming');
    });
  });

  describe('selectStepCount', () => {
    it('returns main step count', () => {
      const state = makeState();
      state.main.stepCount = 42;
      expect(selectStepCount(state)).toBe(42);
    });
  });

  describe('selectActiveSkill', () => {
    it('returns active skill name', () => {
      const state = makeState();
      state.main.activeSkill = 'my-skill';
      expect(selectActiveSkill(state)).toBe('my-skill');
    });

    it('returns null when no active skill', () => {
      expect(selectActiveSkill(makeState())).toBeNull();
    });
  });

  describe('selectActivityTimeline', () => {
    it('flattens thinking/tool/subagent blocks in order', () => {
      const state = makeState();
      state.main.messages = [
        {
          id: 'm1',
          role: 'assistant',
          content: '',
          status: 'completed',
          blocks: [
            { id: 'b1', type: 'thinking', status: 'completed', content: 'hmm' },
            {
              id: 'b2',
              type: 'tool_call',
              status: 'streaming',
              content: '',
              metadata: {
                toolName: 'shell',
                toolArgs: JSON.stringify({ cmd: 'ls -la /tmp/very/long/path/here' }),
              },
            },
            {
              id: 'b3',
              type: 'subagent',
              status: 'completed',
              content: '',
              metadata: { name: 'researcher' },
            },
          ],
        },
      ];
      const tl = selectActivityTimeline(state);
      expect(tl).toEqual([
        { id: 'b1', type: 'thinking', label: '', status: 'done' },
        {
          id: 'b2',
          type: 'tool',
          label: 'shell',
          detail: 'ls -la /tmp/very/long/path/here',
          status: 'running',
        },
        { id: 'b3', type: 'subagent', label: 'researcher', status: 'done' },
      ]);
    });

    it('returns empty when there are no activity blocks', () => {
      expect(selectActivityTimeline(makeState())).toEqual([]);
    });

    it('skips text/other blocks and messages without blocks', () => {
      const state = makeState();
      state.main.messages = [
        { id: 'm0', role: 'assistant', content: 'x', status: 'completed' }, // no blocks field
        {
          id: 'm1',
          role: 'assistant',
          content: 'prose',
          status: 'completed',
          blocks: [
            { id: 't1', type: 'text', status: 'completed', content: 'prose' },
            { id: 'h1', type: 'human_input', status: 'pending', content: '' },
          ],
        },
      ];
      expect(selectActivityTimeline(state)).toEqual([]);
    });

    it('maps statuses, fallbacks, and detail extraction edge cases', () => {
      const state = makeState();
      state.main.messages = [
        {
          id: 'm1',
          role: 'assistant',
          content: '',
          status: 'completed',
          blocks: [
            // thinking still streaming → running
            { id: 'b1', type: 'thinking', status: 'streaming', content: '' },
            // tool without metadata → label fallback 'tool', no detail key
            { id: 'b2', type: 'tool_call', status: 'error', content: '' },
            // tool with non-string toolArgs → no detail
            {
              id: 'b3',
              type: 'tool_call',
              status: 'completed',
              content: '',
              metadata: { toolName: 'x', toolArgs: 42 },
            },
            // tool with unparseable toolArgs → raw-string detail
            {
              id: 'b4',
              type: 'tool_call',
              status: 'completed',
              content: '',
              metadata: { toolName: 'y', toolArgs: '{not json' },
            },
            // tool with >80-char first value → truncated detail
            {
              id: 'b5',
              type: 'tool_call',
              status: 'completed',
              content: '',
              metadata: { toolName: 'z', toolArgs: JSON.stringify({ q: 'x'.repeat(100) }) },
            },
            // sub-agent without name, error status
            { id: 'b6', type: 'subagent', status: 'error', content: '', metadata: {} },
            // sub-agent streaming → running
            {
              id: 'b7',
              type: 'subagent',
              status: 'streaming',
              content: '',
              metadata: { name: 'w' },
            },
          ],
        },
      ];
      const tl = selectActivityTimeline(state);
      expect(tl[0]).toEqual({ id: 'b1', type: 'thinking', label: '', status: 'running' });
      expect(tl[1]).toEqual({ id: 'b2', type: 'tool', label: 'tool', status: 'error' });
      expect(tl[2]).toEqual({ id: 'b3', type: 'tool', label: 'x', status: 'done' });
      expect(tl[3]).toMatchObject({ id: 'b4', detail: '{not json' });
      expect(tl[4].detail).toHaveLength(81); // 80 chars + ellipsis
      expect(tl[4].detail!.endsWith('…')).toBe(true);
      expect(tl[5]).toEqual({ id: 'b6', type: 'subagent', label: 'sub-agent', status: 'error' });
      expect(tl[6]).toEqual({ id: 'b7', type: 'subagent', label: 'w', status: 'running' });
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
});
