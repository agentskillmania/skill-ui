import { describe, it, expect } from 'vitest';
import {
  selectDiagnosticsRunner,
  selectDiagnosticsTools,
  selectDiagnosticsSkills,
  selectDiagnosticsFeatures,
  selectDiagnosticsOverview,
  selectDiagnosticsInfo,
  selectDiagnosticsLLM,
  selectDiagnosticsSystemPrompt,
  selectDiagnosticsAgent,
} from '../../../src/core/diagnostics/selectors.js';
import { createEmptyDiagnosticsState } from '../../../src/core/diagnostics/types.js';
import type { DiagnosticsState } from '../../../src/core/diagnostics/types.js';

function makePopulatedState(): DiagnosticsState {
  return {
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
      tools: [{ name: 'file_read', description: 'Read', type: 'builtin', enabled: true }],
      skills: [{ name: 'spec-plan', description: 'Plan', source: '/skills' }],
    },
    agent: { id: 'state-1', config: { name: 'test' } },
    llm: { messages: [{ role: 'system', content: 'sys' }], tools: ['file_read'], skill: null },
    systemPrompt: 'You are...',
    session: {
      overview: {
        title: 'T',
        agentName: 'a',
        model: 'm',
        stepCount: 1,
        messageCount: 2,
        status: 'idle',
        createdAt: '',
        updatedAt: '',
      },
      info: {
        sessionId: 's1',
        agentName: 'a',
        model: 'm',
        workspacePath: '/x',
      },
    },
  };
}

describe('diagnostics selectors', () => {
  describe('selectDiagnosticsRunner', () => {
    it('returns runner from populated state', () => {
      const runner = selectDiagnosticsRunner(makePopulatedState());
      expect(runner).not.toBeNull();
      expect(runner!.tools).toHaveLength(1);
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsRunner(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsTools', () => {
    it('returns tools from populated state', () => {
      const tools = selectDiagnosticsTools(makePopulatedState());
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('file_read');
    });

    it('returns empty array from empty state', () => {
      expect(selectDiagnosticsTools(createEmptyDiagnosticsState())).toEqual([]);
    });
  });

  describe('selectDiagnosticsSkills', () => {
    it('returns skills from populated state', () => {
      const skills = selectDiagnosticsSkills(makePopulatedState());
      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('spec-plan');
    });

    it('returns empty array from empty state', () => {
      expect(selectDiagnosticsSkills(createEmptyDiagnosticsState())).toEqual([]);
    });
  });

  describe('selectDiagnosticsFeatures', () => {
    it('returns features from populated state', () => {
      const features = selectDiagnosticsFeatures(makePopulatedState());
      expect(features).not.toBeNull();
      expect(features!.sandbox).toBe(true);
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsFeatures(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsOverview', () => {
    it('returns overview from populated state', () => {
      const overview = selectDiagnosticsOverview(makePopulatedState());
      expect(overview?.title).toBe('T');
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsOverview(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsInfo', () => {
    it('returns info from populated state', () => {
      const info = selectDiagnosticsInfo(makePopulatedState());
      expect(info?.sessionId).toBe('s1');
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsInfo(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsLLM', () => {
    it('returns llm from populated state', () => {
      const llm = selectDiagnosticsLLM(makePopulatedState());
      expect(llm).not.toBeNull();
      expect(llm!.messages).toHaveLength(1);
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsLLM(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsSystemPrompt', () => {
    it('returns systemPrompt from populated state', () => {
      expect(selectDiagnosticsSystemPrompt(makePopulatedState())).toBe('You are...');
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsSystemPrompt(createEmptyDiagnosticsState())).toBeNull();
    });
  });

  describe('selectDiagnosticsAgent', () => {
    it('returns agent from populated state', () => {
      const agent = selectDiagnosticsAgent(makePopulatedState());
      expect(agent).not.toBeNull();
      expect((agent as { id: string }).id).toBe('state-1');
    });

    it('returns null from empty state', () => {
      expect(selectDiagnosticsAgent(createEmptyDiagnosticsState())).toBeNull();
    });
  });
});
