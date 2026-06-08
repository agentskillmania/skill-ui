/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { SessionSection } from '../../../../src/sections/session/SessionSection.js';
import type { SessionOverviewData, SessionInfoData } from '../../../../src/sections/session/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create minimal valid SessionOverviewData. */
function createOverview(overrides: Partial<SessionOverviewData> = {}): SessionOverviewData {
  return {
    title: 'Fix auth bug',
    agentName: 'debug-agent',
    model: 'claude-sonnet-4-6',
    stepCount: 12,
    messageCount: 47,
    status: 'running',
    createdAt: '2026-01-01T14:32:00Z',
    updatedAt: '2026-01-01T14:33:00Z',
    ...overrides,
  };
}

/** Helper: create minimal valid SessionInfoData. */
function createInfo(overrides: Partial<SessionInfoData> = {}): SessionInfoData {
  return {
    sessionId: '123-abc',
    agentName: 'debug-agent',
    model: 'claude-sonnet-4-6',
    workspacePath: '/tmp',
    skillDirs: [],
    mcpConfigPaths: [],
    ...overrides,
  };
}

describe('SessionSection', () => {
  it('renders both Overview and Info cards', () => {
    const { container } = renderWithTheme(
      <SessionSection overview={createOverview()} info={createInfo()} />,
    );
    // Title from overview card
    expect(screen.getByText('Fix auth bug')).toBeInTheDocument();
    // SessionInfoCard is rendered as a Card — verify it exists
    const cards = container.querySelectorAll('.ant-card');
    expect(cards.length).toBeGreaterThanOrEqual(2); // Overview + Info cards
    // InfoCard is collapsed by default — click toggle to expand
    const toggleButtons = screen.getAllByTestId('collapse-toggle');
    fireEvent.click(toggleButtons[1]); // Second toggle is InfoCard
    // Verify the info group header is rendered (zh-CN: 身份信息)
    expect(screen.getByText('身份信息')).toBeInTheDocument();
  });

  it('renders section header with "Session" text', () => {
    renderWithTheme(
      <SessionSection overview={createOverview()} info={createInfo()} />,
    );
    expect(screen.getByText('Session')).toBeInTheDocument();
  });

  it('renders overview status badge', () => {
    renderWithTheme(
      <SessionSection overview={createOverview({ status: 'running' })} info={createInfo()} />,
    );
    // zh-CN mock returns '运行中' for session.overview.statusRunning
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('renders agent and model from overview', () => {
    renderWithTheme(
      <SessionSection overview={createOverview()} info={createInfo()} />,
    );
    expect(screen.getByText('debug-agent · claude-sonnet-4-6')).toBeInTheDocument();
  });

  it('renders step and message counts from overview', () => {
    renderWithTheme(
      <SessionSection
        overview={createOverview({ stepCount: 5, messageCount: 10 })}
        info={createInfo()}
      />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
