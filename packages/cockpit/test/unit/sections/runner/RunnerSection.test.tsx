/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { RunnerSection } from '../../../../src/sections/runner/RunnerSection.js';
import type { RunnerDiagnosticsData } from '../../../../src/sections/runner/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create runner diagnostics. */
function createRunner(overrides: Partial<RunnerDiagnosticsData> = {}): RunnerDiagnosticsData {
  return {
    features: {
      sandbox: true,
      thinkingEnabled: false,
      enablePromptThinking: false,
      a2uiEnabled: false,
      compressorEnabled: false,
      enableSession: true,
      enableTodolist: true,
      enableCommands: true,
    },
    tools: [
      { name: 'file_read', description: 'Read files', type: 'builtin', enabled: true },
    ],
    skills: [
      { name: 'spec-plan', description: 'Plan specs', source: '/skills/spec-plan' },
    ],
    ...overrides,
  };
}

describe('RunnerSection', () => {
  it('renders section header with "Runner" text', () => {
    renderWithTheme(<RunnerSection />);
    expect(screen.getByText('Runner')).toBeInTheDocument();
  });

  it('renders all three cards with empty state when no props', () => {
    renderWithTheme(<RunnerSection />);
    // FeatureTagsCard empty → "—"
    expect(screen.getByText('—')).toBeInTheDocument();
    // ToolsCard empty → "暂无工具"
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
    // SkillsCard empty → "暂无技能"
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('renders FeatureTagsCard with populated features', () => {
    renderWithTheme(<RunnerSection runner={createRunner()} />);
    expect(screen.getByTestId('feature-tag-sandbox')).toBeInTheDocument();
  });

  it('renders ToolsCard with populated tools', () => {
    renderWithTheme(<RunnerSection runner={createRunner()} />);
    expect(screen.getByTestId('tool-item-file_read')).toBeInTheDocument();
  });

  it('renders SkillsCard with populated skills', () => {
    renderWithTheme(<RunnerSection runner={createRunner()} />);
    expect(screen.getByTestId('skill-item-spec-plan')).toBeInTheDocument();
  });

  it('renders all cards with full data simultaneously', () => {
    renderWithTheme(<RunnerSection runner={createRunner()} />);
    expect(screen.getByTestId('feature-tag-sandbox')).toBeInTheDocument();
    expect(screen.getByTestId('tool-item-file_read')).toBeInTheDocument();
    expect(screen.getByTestId('skill-item-spec-plan')).toBeInTheDocument();
  });

  it('handles null runner gracefully', () => {
    renderWithTheme(<RunnerSection runner={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });

  it('handles partial runner data — only features', () => {
    renderWithTheme(
      <RunnerSection
        runner={{
          features: { sandbox: true },
          tools: null,
          skills: null,
        }}
      />,
    );
    expect(screen.getByTestId('feature-tag-sandbox')).toBeInTheDocument();
    expect(screen.getByText('暂无工具')).toBeInTheDocument();
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
  });
});
