/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import type { SessionOverviewData } from '../../../../src/sections/session/types.js';
import { SessionOverviewCard } from '../../../../src/sections/session/SessionOverviewCard.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create minimal valid SessionOverviewData. */
function createData(overrides: Partial<SessionOverviewData> = {}): SessionOverviewData {
  return {
    title: 'Test Session',
    agentName: 'test-agent',
    model: 'gpt-4',
    stepCount: 10,
    messageCount: 25,
    tokensIn: 9768,
    tokensOut: 4200,
    tokensTotal: 13968,
    estimatedContextSize: 8000,
    contextWindow: 128000,
    status: 'idle',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    ...overrides,
  };
}

describe('SessionOverviewCard', () => {
  it('renders session title', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ title: 'My Session' })} />);
    expect(screen.getByText('My Session')).toBeInTheDocument();
  });

  it('renders fallback title when title is missing', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ title: undefined })} />);
    // zh-CN mock returns '未命名会话'
    expect(screen.getByText('未命名会话')).toBeInTheDocument();
  });

  it('renders agent name and model', () => {
    renderWithTheme(<SessionOverviewCard data={createData()} />);
    expect(screen.getByText('test-agent · gpt-4')).toBeInTheDocument();
  });

  it('renders step and message count values', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ stepCount: 42, messageCount: 99 })} />);
    // Antd Statistic renders the value directly
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('renders token formatted values', () => {
    renderWithTheme(
      <SessionOverviewCard
        data={createData({ tokensIn: 9768, tokensOut: 1200, tokensTotal: 10968 })}
      />,
    );
    // formatTokens: 9768 → "9.8k", 1200 → "1.2k", 10968 → "11.0k"
    expect(screen.getByText('9.8k')).toBeInTheDocument();
    expect(screen.getByText('1.2k')).toBeInTheDocument();
    expect(screen.getByText('11.0k')).toBeInTheDocument();
  });

  it('shows progress bar when contextWindow is available', () => {
    const { container } = renderWithTheme(
      <SessionOverviewCard
        data={createData({ estimatedContextSize: 64000, contextWindow: 128000 })}
      />,
    );
    // Ant Design Progress renders a .ant-progress element
    const progressEl = container.querySelector('.ant-progress');
    expect(progressEl).toBeInTheDocument();
  });

  it('hides progress bar when contextWindow is undefined', () => {
    const { container } = renderWithTheme(
      <SessionOverviewCard data={createData({ contextWindow: undefined })} />,
    );
    const progressEl = container.querySelector('.ant-progress');
    expect(progressEl).not.toBeInTheDocument();
  });

  it('renders status badge for running status', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ status: 'running' })} />);
    // zh-CN mock returns '运行中' for session.overview.statusRunning
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('renders status badge for idle status', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ status: 'idle' })} />);
    // zh-CN mock returns '空闲' for session.overview.statusIdle
    expect(screen.getByText('空闲')).toBeInTheDocument();
  });

  it('renders status badge for error status', () => {
    renderWithTheme(<SessionOverviewCard data={createData({ status: 'error' })} />);
    // zh-CN mock returns '错误' for session.overview.statusError
    expect(screen.getByText('错误')).toBeInTheDocument();
  });
});
