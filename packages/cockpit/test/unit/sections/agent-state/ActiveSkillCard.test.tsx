/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { ActiveSkillCard } from '../../../../src/sections/agent-state/ActiveSkillCard.js';
import type { SkillStateData } from '../../../../src/sections/agent-state/types.js';

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

describe('ActiveSkillCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "No active skill" when skillState is null', () => {
    renderWithTheme(<ActiveSkillCard skillState={null} />);
    expect(screen.getByText('无活动技能')).toBeInTheDocument();
  });

  it('renders "No active skill" when skillState is undefined', () => {
    renderWithTheme(<ActiveSkillCard />);
    expect(screen.getByText('无活动技能')).toBeInTheDocument();
  });

  it('renders "No active skill" when current is null', () => {
    renderWithTheme(<ActiveSkillCard skillState={createSkillState({ current: null })} />);
    expect(screen.getByText('无活动技能')).toBeInTheDocument();
  });

  it('renders current skill name when active', () => {
    renderWithTheme(<ActiveSkillCard skillState={createSkillState({ current: 'code-review' })} />);
    expect(screen.getByTestId('active-skill-name')).toHaveTextContent('code-review');
  });

  it('renders stack depth tag when stack is non-empty', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({
          stack: [
            { skillName: 'outer', loadedAt: Date.now() - 5000 },
            { skillName: 'inner', loadedAt: Date.now() - 2000 },
          ],
        })}
      />,
    );
    expect(screen.getByText('深度 2')).toBeInTheDocument();
  });

  it('does not render depth tag when stack is empty', () => {
    renderWithTheme(<ActiveSkillCard skillState={createSkillState({ stack: [] })} />);
    expect(screen.queryByText(/深度/)).not.toBeInTheDocument();
  });

  it('renders stack frames directly without needing to toggle', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({
          stack: [
            { skillName: 'analyze', loadedAt: Date.now() - 45000 },
            { skillName: 'review', loadedAt: Date.now() - 5000 },
          ],
        })}
      />,
    );

    // Stack frames visible immediately, no toggle needed
    expect(screen.getByText('analyze')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText('45s ago')).toBeInTheDocument();
    expect(screen.getByText('5s ago')).toBeInTheDocument();
  });

  it('renders instructions truncated, click to expand', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({
          loadedInstructions: 'You are a code reviewer.',
        })}
      />,
    );

    // Instructions visible immediately (truncated by default)
    const toggle = screen.getByTestId('instructions-toggle');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByText('You are a code reviewer.')).toBeInTheDocument();

    // Click to expand — pre text wraps fully
    fireEvent.click(toggle);
    expect(screen.getByText('You are a code reviewer.')).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(toggle);
    expect(screen.getByText('You are a code reviewer.')).toBeInTheDocument();
  });

  it('does not render instructions section when loadedInstructions is empty', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({ loadedInstructions: undefined })}
      />,
    );
    expect(screen.queryByTestId('instructions-toggle')).not.toBeInTheDocument();
  });

  it('supports keyboard interaction on instructions', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({
          loadedInstructions: 'Review code.',
        })}
      />,
    );

    const toggle = screen.getByTestId('instructions-toggle');
    fireEvent.keyDown(toggle, { key: 'Enter' });
    // Expanded state — content still visible
    expect(screen.getByText('Review code.')).toBeInTheDocument();
  });

  it('collapses card body when toggle button is clicked', () => {
    renderWithTheme(
      <ActiveSkillCard
        skillState={createSkillState({ current: 'test-skill' })}
      />,
    );

    expect(screen.getByTestId('active-skill-name')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('active-skill-collapse'));
    expect(screen.queryByTestId('active-skill-name')).not.toBeInTheDocument();
  });
});
