/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { FeatureTagsCard } from '../../../../src/sections/runner/FeatureTagsCard.js';
import type { RunnerFeatureFlags } from '../../../../src/sections/runner/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create feature flags. */
function createFeatures(overrides: Partial<RunnerFeatureFlags> = {}): RunnerFeatureFlags {
  return {
    sandbox: true,
    thinkingEnabled: false,
    enablePromptThinking: false,
    a2uiEnabled: false,
    compressorEnabled: false,
    enableSession: true,
    enableTodolist: true,
    enableCommands: true,
    ...overrides,
  };
}

describe('FeatureTagsCard', () => {
  it('renders empty state when features is null', () => {
    renderWithTheme(<FeatureTagsCard features={null} />);
    // The card renders a dash for empty state
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders empty state when features is undefined', () => {
    renderWithTheme(<FeatureTagsCard />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders all feature tags when features provided', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures()} />);
    expect(screen.getByTestId('feature-tag-sandbox')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-thinkingEnabled')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-enablePromptThinking')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-a2uiEnabled')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-compressorEnabled')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-enableSession')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-enableTodolist')).toBeInTheDocument();
    expect(screen.getByTestId('feature-tag-enableCommands')).toBeInTheDocument();
  });

  it('renders 8 feature tags total', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures()} />);
    const tags = screen.getAllByTestId(/^feature-tag-/);
    expect(tags).toHaveLength(8);
  });

  it('shows success color for enabled features', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures({ sandbox: true })} />);
    const tag = screen.getByTestId('feature-tag-sandbox');
    // antd Tag with color="success" gets the ant-tag-success class
    expect(tag.className).toContain('success');
  });

  it('shows default color for disabled features', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures({ thinkingEnabled: false })} />);
    const tag = screen.getByTestId('feature-tag-thinkingEnabled');
    expect(tag.className).toContain('default');
  });

  it('renders feature label text from i18n', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures()} />);
    // zh-CN translations: sandbox → "沙箱"
    expect(screen.getByText('沙箱')).toBeInTheDocument();
    expect(screen.getByText('思考')).toBeInTheDocument();
    expect(screen.getByText('待办')).toBeInTheDocument();
    expect(screen.getByText('命令')).toBeInTheDocument();
  });

  it('renders title from i18n', () => {
    renderWithTheme(<FeatureTagsCard features={createFeatures()} />);
    // zh-CN: runner.features.title → "功能特性"
    expect(screen.getByText('功能特性')).toBeInTheDocument();
  });
});
