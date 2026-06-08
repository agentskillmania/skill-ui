import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { SessionInfoCard } from '../../../../src/sections/session/SessionInfoCard.js';
import type { SessionInfoData } from '../../../../src/sections/session/types.js';

/** Helper to wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Minimal valid SessionInfoData for tests. */
const baseData: SessionInfoData = {
  sessionId: 'sess-abc-123',
  agentName: 'debug-agent',
  model: 'claude-sonnet-4-6',
  tokensIn: 8241,
  tokensOut: 3102,
  tokensTotal: 11343,
  workspacePath: '/home/user/project',
  sessionPath: '/home/user/.sessions/sess-abc-123',
  agentConfigPath: '/etc/agents/debug-agent.yaml',
  skillDirs: ['/home/user/skills', '/opt/shared/skills'],
  mcpConfigPaths: ['/etc/mcp/config.json'],
};

describe('SessionInfoCard', () => {
  it('renders session ID value', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    expect(screen.getByText('sess-abc-123')).toBeInTheDocument();
  });

  it('renders agent name', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    expect(screen.getByText('debug-agent')).toBeInTheDocument();
  });

  it('renders model in code style', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    expect(screen.getByText('claude-sonnet-4-6')).toBeInTheDocument();
  });

  it('renders token values as formatted numbers', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    // toLocaleString() in Node produces locale-formatted numbers
    expect(screen.getByText('8,241')).toBeInTheDocument();
    expect(screen.getByText('3,102')).toBeInTheDocument();
    expect(screen.getByText('11,343')).toBeInTheDocument();
  });

  it('renders workspace path', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    expect(screen.getByText('/home/user/project')).toBeInTheDocument();
  });

  it('renders skill directory paths', () => {
    renderWithTheme(<SessionInfoCard data={baseData} />);
    expect(screen.getByText('/home/user/skills')).toBeInTheDocument();
    expect(screen.getByText('/opt/shared/skills')).toBeInTheDocument();
  });

  it('renders "-" for missing optional agentConfigPath', () => {
    const { agentConfigPath: _, ...dataWithoutConfig } = baseData;
    renderWithTheme(<SessionInfoCard data={dataWithoutConfig as SessionInfoData} />);
    // There may be multiple '-' in the DOM for undefined token fields too
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders "-" for undefined token fields', () => {
    const minimalData: SessionInfoData = {
      sessionId: 'sess-minimal',
      agentName: 'test-agent',
      model: 'gpt-4',
      workspacePath: '/tmp',
      skillDirs: [],
      mcpConfigPaths: [],
    };
    renderWithTheme(<SessionInfoCard data={minimalData} />);
    // tokensIn, tokensOut, tokensTotal are undefined → three '-'
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders "-" for empty skill and mcp arrays', () => {
    const minimalData: SessionInfoData = {
      sessionId: 'sess-empty',
      agentName: 'test-agent',
      model: 'gpt-4',
      workspacePath: '/tmp',
      skillDirs: [],
      mcpConfigPaths: [],
    };
    renderWithTheme(<SessionInfoCard data={minimalData} />);
    // skillDirs empty → '-', mcpConfigPaths empty → '-'
    const dashes = screen.getAllByText('-');
    // At least 5 dashes: tokensIn, tokensOut, tokensTotal, skillDirs, mcpConfigPaths
    expect(dashes.length).toBeGreaterThanOrEqual(5);
  });

  it('does not render sessionDir row when sessionPath is undefined', () => {
    const { sessionPath: _, ...dataWithoutSessionPath } = baseData;
    renderWithTheme(<SessionInfoCard data={dataWithoutSessionPath as SessionInfoData} />);
    // sessionPath should not appear at all
    expect(screen.queryByText('/home/user/.sessions/sess-abc-123')).not.toBeInTheDocument();
  });
});
