/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
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
    current: null,
    ...overrides,
  };
}

describe('ActiveSkillCard', () => {
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

  it('collapses card body when toggle button is clicked', () => {
    renderWithTheme(<ActiveSkillCard skillState={createSkillState({ current: 'test-skill' })} />);

    expect(screen.getByTestId('active-skill-name')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.queryByTestId('active-skill-name')).not.toBeInTheDocument();
  });
});
