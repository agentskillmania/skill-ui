/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { SkillsCard } from '../../../../src/sections/runner/SkillsCard.js';
import type { RunnerSkillInfo } from '../../../../src/sections/runner/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('SkillsCard', () => {
  it('renders empty state when skills is null', () => {
    renderWithTheme(<SkillsCard skills={null} />);
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('renders empty state when skills is undefined', () => {
    renderWithTheme(<SkillsCard />);
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('renders empty state when skills is empty array', () => {
    renderWithTheme(<SkillsCard skills={[]} />);
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('renders skill items with names', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'spec-plan', description: 'Plan specs', source: '/skills/spec-plan' },
      { name: 'a2ui-gen', description: 'A2UI gen', source: '/skills/a2ui' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    expect(screen.getByTestId('skill-item-spec-plan')).toBeInTheDocument();
    expect(screen.getByTestId('skill-item-a2ui-gen')).toBeInTheDocument();
  });

  it('renders source path for each skill', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'spec-plan', source: '/skills/spec-plan' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    expect(screen.getByText('/skills/spec-plan')).toBeInTheDocument();
  });

  it('renders collapse toggle in card header', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'skill-a' },
      { name: 'skill-b' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    expect(screen.getByTestId('skills-collapse-toggle')).toBeInTheDocument();
  });

  it('collapses card body when toggle is clicked', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'skill-a' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    expect(screen.getByTestId('skill-item-skill-a')).toBeInTheDocument();

    // Click collapse toggle
    fireEvent.click(screen.getByTestId('skills-collapse-toggle'));
    expect(screen.queryByTestId('skill-item-skill-a')).not.toBeInTheDocument();
  });

  it('toggles skill description on click', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'spec-plan', description: 'Plan and execute specifications', source: '/skills/spec-plan' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);

    // Description not visible initially
    expect(screen.queryByText('Plan and execute specifications')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByTestId('skill-toggle-spec-plan'));
    expect(screen.getByText('Plan and execute specifications')).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(screen.getByTestId('skill-toggle-spec-plan'));
    expect(screen.queryByText('Plan and execute specifications')).not.toBeInTheDocument();
  });

  it('does not render description area when description is missing', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'no-desc-skill', source: '/skills/no-desc' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    fireEvent.click(screen.getByTestId('skill-toggle-no-desc-skill'));
    // Item should exist, no crash, but no description text
    expect(screen.getByTestId('skill-item-no-desc-skill')).toBeInTheDocument();
  });

  it('renders card title from i18n', () => {
    renderWithTheme(<SkillsCard skills={[{ name: 'test' }]} />);
    // zh-CN: runner.skills.title → "技能"
    expect(screen.getByText('技能')).toBeInTheDocument();
  });

  it('handles skill without source gracefully', () => {
    const skills: RunnerSkillInfo[] = [
      { name: 'no-source-skill', description: 'A skill' },
    ];
    renderWithTheme(<SkillsCard skills={skills} />);
    expect(screen.getByTestId('skill-item-no-source-skill')).toBeInTheDocument();
  });
});
