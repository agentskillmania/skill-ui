import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { McpConfigPanel } from '../../src/components/McpConfigPanel.js';
import type { McpConfig } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

const defaultValue: McpConfig = {
  loadGlobal: true,
  enabledServers: ['filesystem'],
  availableServers: [
    { name: 'filesystem', command: 'npx @mcp/server-filesystem' },
    { name: 'github', command: 'npx @mcp/server-github' },
    { name: 'puppeteer', command: 'npx @mcp/server-puppeteer' },
  ],
};

describe('McpConfigPanel', () => {
  it('renders global toggle and server list', () => {
    render(<McpConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('mcp-loadGlobal')).toBeInTheDocument();
    expect(screen.getByTestId('mcp-server-filesystem')).toBeInTheDocument();
    expect(screen.getByTestId('mcp-server-github')).toBeInTheDocument();
    expect(screen.getByTestId('mcp-server-puppeteer')).toBeInTheDocument();
  });

  it('shows hint bar above list when servers exist', () => {
    render(<McpConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('mcp-hint-bar')).toBeInTheDocument();
    // Hint bar contains link to mcporter.sh
    const link = screen.getByRole('link', { name: /mcporter\.sh/i });
    expect(link).toHaveAttribute('href', 'https://mcporter.sh/');
  });

  it('hides server list when loadGlobal is false', () => {
    const noGlobal = { ...defaultValue, loadGlobal: false };
    render(<McpConfigPanel value={noGlobal} onChange={() => {}} />, { wrapper });

    expect(screen.queryByTestId('mcp-server-filesystem')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mcp-hint-bar')).not.toBeInTheDocument();
  });

  it('shows empty state when no servers available', () => {
    const empty: McpConfig = {
      loadGlobal: true,
      enabledServers: [],
      availableServers: [],
    };
    render(<McpConfigPanel value={empty} onChange={() => {}} />, { wrapper });

    expect(screen.getByTestId('mcp-empty-state')).toBeInTheDocument();
    expect(screen.getByText('mcp.emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('mcp.emptyHint')).toBeInTheDocument();
  });

  it('empty state links to mcporter.sh', () => {
    const empty: McpConfig = {
      loadGlobal: true,
      enabledServers: [],
      availableServers: [],
    };
    render(<McpConfigPanel value={empty} onChange={() => {}} />, { wrapper });

    const link = screen.getByRole('link', { name: /mcp\.emptyDocs/i });
    expect(link).toHaveAttribute('href', 'https://mcporter.sh/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls onChange when global toggle changes', async () => {
    const onChange = vi.fn();
    render(<McpConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const toggle = screen.getByTestId('mcp-loadGlobal');
    await userEvent.click(toggle);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].loadGlobal).toBe(false);
    // enabledServers preserved
    expect(onChange.mock.calls[0][0].enabledServers).toEqual(['filesystem']);
  });

  it('calls onChange when server checkbox toggled', async () => {
    const onChange = vi.fn();
    render(<McpConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const githubRow = screen.getByTestId('mcp-server-github');
    const checkbox = githubRow.querySelector('input[type="checkbox"]')!;
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0];
    expect(result.enabledServers).toContain('github');
    expect(result.enabledServers).toContain('filesystem');
  });

  it('removes server from enabledServers when unchecked', async () => {
    const onChange = vi.fn();
    render(<McpConfigPanel value={defaultValue} onChange={onChange} />, { wrapper });

    const fsRow = screen.getByTestId('mcp-server-filesystem');
    const checkbox = fsRow.querySelector('input[type="checkbox"]')!;
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0];
    expect(result.enabledServers).not.toContain('filesystem');
  });

  it('renders server command details', () => {
    render(<McpConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByText(/npx @mcp\/server-filesystem/)).toBeInTheDocument();
    expect(screen.getByText(/npx @mcp\/server-github/)).toBeInTheDocument();
  });

  it('renders server with args in command detail', () => {
    const withArgs: McpConfig = {
      ...defaultValue,
      availableServers: [
        { name: 'my-server', command: 'node', args: ['server.js', '--port', '8080'] },
      ],
      enabledServers: [],
    };
    render(<McpConfigPanel value={withArgs} onChange={() => {}} />, { wrapper });

    expect(screen.getByText(/node server\.js --port 8080/)).toBeInTheDocument();
  });

  it('renders i18n keys', () => {
    render(<McpConfigPanel value={defaultValue} onChange={() => {}} />, { wrapper });

    expect(screen.getByText('mcp.availableServers')).toBeInTheDocument();
  });
});
