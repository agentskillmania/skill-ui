/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { AgentStateSection } from '../../../../src/sections/agent-state/AgentStateSection.js';
import type { SkillStateData, CompressionData } from '../../../../src/sections/agent-state/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create minimal valid SkillStateData. */
function createSkillState(overrides: Partial<SkillStateData> = {}): SkillStateData {
  return {
    current: 'execute-plan',
    stack: [],
    ...overrides,
  };
}

/** Helper: create minimal valid CompressionData. */
function createCompression(overrides: Partial<CompressionData> = {}): CompressionData {
  return {
    summary: 'Compressed.',
    anchor: 10,
    ...overrides,
  };
}

/** LLM data shape matching daemon's lastLLMRequest. */
type LLMSnapshot = { messages: unknown[]; tools?: unknown[] };

/** Helper: create minimal valid LLM snapshot data. */
function createLLMContext(overrides: Partial<LLMSnapshot> = {}): LLMSnapshot {
  return {
    messages: [{ role: 'system', content: 'You are helpful.' }],
    ...overrides,
  };
}

describe('AgentStateSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders section header with "Agent State" text', () => {
    renderWithTheme(<AgentStateSection />);
    expect(screen.getByText('Agent State')).toBeInTheDocument();
  });

  it('renders all three cards with empty state when no props', () => {
    renderWithTheme(<AgentStateSection />);
    expect(screen.getByText('无活动技能')).toBeInTheDocument();
    expect(screen.getByText('未压缩')).toBeInTheDocument();
    expect(screen.getByText('暂无请求')).toBeInTheDocument();
  });

  it('renders ActiveSkillCard with populated data', () => {
    renderWithTheme(
      <AgentStateSection skillState={createSkillState({ current: 'code-review' })} />,
    );
    expect(screen.getByTestId('active-skill-name')).toHaveTextContent('code-review');
  });

  it('renders CompressionCard with populated data', () => {
    renderWithTheme(
      <AgentStateSection compression={createCompression({ anchor: 42 })} />,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders LLMContextCard with populated data', () => {
    renderWithTheme(
      <AgentStateSection llm={createLLMContext({ messages: [{ role: 'system', content: 'Hi' }] })} />,
    );
    // Should show message count = 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders all cards with full data simultaneously', () => {
    renderWithTheme(
      <AgentStateSection
        skillState={createSkillState({ current: 'plan' })}
        compression={createCompression({ anchor: 5 })}
        llm={createLLMContext({ messages: [{ role: 'system', content: 'Test' }] })}
      />,
    );
    expect(screen.getByTestId('active-skill-name')).toHaveTextContent('plan');
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
