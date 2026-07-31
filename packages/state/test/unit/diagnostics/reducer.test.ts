import { describe, it, expect } from 'vitest';
import { diagnosticsReducer } from '../../../src/core/diagnostics/reducer.js';
import { createEmptyDiagnosticsState } from '../../../src/core/diagnostics/types.js';
import type { SSEEvent } from '../../../src/core/types.js';

describe('diagnosticsReducer', () => {
  it('returns empty state by default', () => {
    const state = createEmptyDiagnosticsState();
    expect(state.runner).toBeNull();
    expect(state.agent).toBeNull();
    expect(state.llm).toBeNull();
    expect(state.systemPrompt).toBeNull();
    expect(state.session.overview).toBeNull();
    expect(state.session.info).toBeNull();
  });

  it('replaces entire state on agent-diagnostics event (snapshot semantics)', () => {
    const event: SSEEvent = {
      event: 'agent-diagnostics',
      data: {
        runner: {
          features: {
            sandbox: true,
            thinkingEnabled: false,
            enablePromptThinking: false,
            a2uiEnabled: false,
            compressorEnabled: true,
            enableSession: true,
            enableTodolist: true,
            enableCommands: true,
          },
          tools: [{ name: 'file_read', description: 'Read files', type: 'builtin', enabled: true }],
          skills: [{ name: 'spec-plan', description: 'Plan specs', source: '/skills/spec-plan' }],
        },
        agent: {
          id: 'test-state',
          config: { name: 'test', instructions: '', tools: [] },
          context: { messages: [], stepCount: 5 },
        },
        llm: {
          messages: [{ role: 'system', content: 'You are...' }],
          tools: ['file_read'],
          skill: null,
        },
        systemPrompt: 'You are...',
        session: {
          overview: {
            title: 'Test Session',
            agentName: 'test',
            model: 'test-model',
            stepCount: 5,
            messageCount: 3,
            status: 'idle',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
          info: {
            sessionId: 'sess-123',
            agentName: 'test',
            model: 'test-model',
            workspacePath: '/test',
          },
        },
      },
    };

    const state = diagnosticsReducer(createEmptyDiagnosticsState(), event);
    expect(state.runner).not.toBeNull();
    expect(state.runner!.features.sandbox).toBe(true);
    expect(state.runner!.tools).toHaveLength(1);
    expect(state.runner!.skills).toHaveLength(1);
    expect(state.agent).not.toBeNull();
    expect(state.llm).not.toBeNull();
    expect(state.systemPrompt).toBe('You are...');
    expect(state.session.overview?.title).toBe('Test Session');
    expect(state.session.info?.sessionId).toBe('sess-123');
  });

  it('handles null llm field', () => {
    const event: SSEEvent = {
      event: 'agent-diagnostics',
      data: {
        runner: { features: null, tools: [], skills: [] },
        agent: null,
        llm: null,
        systemPrompt: null,
        session: {
          overview: {
            agentName: 'test',
            model: 'm',
            stepCount: 0,
            messageCount: 0,
            status: 'idle',
            createdAt: '',
            updatedAt: '',
          },
          info: { sessionId: 's1', agentName: 'test', model: 'm', workspacePath: '/' },
        },
      },
    };
    const state = diagnosticsReducer(createEmptyDiagnosticsState(), event);
    expect(state.llm).toBeNull();
    expect(state.agent).toBeNull();
    expect(state.systemPrompt).toBeNull();
  });

  it('ignores non-agent-diagnostics events (returns state unchanged)', () => {
    const prevState = createEmptyDiagnosticsState();
    const state = diagnosticsReducer(prevState, { event: 'token', data: { delta: 'hi' } });
    expect(state).toBe(prevState);
  });

  it('preserves last known state when event data is malformed (empty data)', () => {
    const prevState = createEmptyDiagnosticsState();
    const state = diagnosticsReducer(prevState, { event: 'agent-diagnostics', data: {} });
    expect(state).toEqual(prevState);
  });

  it('second snapshot replaces first entirely (snapshot semantics — old fields discarded)', () => {
    // First snapshot: full state with runner, agent, llm, systemPrompt, session
    const firstEvent: SSEEvent = {
      event: 'agent-diagnostics',
      data: {
        runner: { features: { sandbox: true }, tools: [{ name: 'shell' }], skills: [] },
        agent: { id: 'state-1' },
        llm: { messages: [{ role: 'system', content: 'prompt-1' }] },
        systemPrompt: 'prompt-1',
        session: {
          overview: {
            agentName: 'a',
            model: 'm',
            stepCount: 5,
            messageCount: 3,
            status: 'running',
            createdAt: '',
            updatedAt: '',
          },
          info: { sessionId: 's1', agentName: 'a', model: 'm', workspacePath: '/x' },
        },
      },
    };

    // Second snapshot: omits llm and systemPrompt, different runner
    const secondEvent: SSEEvent = {
      event: 'agent-diagnostics',
      data: {
        runner: { features: { sandbox: false }, tools: [], skills: [] },
        agent: { id: 'state-2' },
        llm: null,
        systemPrompt: null,
        session: {
          overview: {
            agentName: 'b',
            model: 'm2',
            stepCount: 10,
            messageCount: 7,
            status: 'idle',
            createdAt: '',
            updatedAt: '',
          },
          info: { sessionId: 's2', agentName: 'b', model: 'm2', workspacePath: '/y' },
        },
      },
    };

    let state = diagnosticsReducer(createEmptyDiagnosticsState(), firstEvent);
    state = diagnosticsReducer(state, secondEvent);

    // Second snapshot should have fully replaced first
    expect(state.runner?.features?.sandbox).toBe(false); // not true from first
    expect(state.runner?.tools).toEqual([]); // not [{ name: 'shell' }] from first
    expect(state.agent).toEqual({ id: 'state-2' }); // not state-1
    expect(state.llm).toBeNull(); // discarded from first
    expect(state.systemPrompt).toBeNull(); // discarded from first
    expect(state.session.info?.sessionId).toBe('s2'); // not s1
  });

  it('handles null runner field', () => {
    const event: SSEEvent = {
      event: 'agent-diagnostics',
      data: {
        runner: null,
        agent: null,
        llm: null,
        systemPrompt: null,
        session: {},
      },
    };
    const state = diagnosticsReducer(createEmptyDiagnosticsState(), event);
    expect(state.runner).toBeNull();
  });
});
