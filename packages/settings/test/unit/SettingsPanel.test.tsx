import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { ConfigProvider } from 'antd';
import { lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SettingsPanel } from '../../src/components/SettingsPanel.js';
import type { DaemonConfig, McpConfig, AppPreferences } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const daemonConfig: DaemonConfig = {
  llm: {
    providers: [
      {
        name: 'openai',
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        models: [{ modelId: 'gpt-4o' }],
      },
    ],
  },
  server: { host: 'localhost', port: 3100 },
};

const mcpConfig: McpConfig = {
  loadGlobal: true,
  enabledServers: ['filesystem'],
  availableServers: [{ name: 'filesystem', command: 'npx @mcp/server-filesystem' }],
};

const preferences: AppPreferences = {
  theme: 'system',
  language: 'zh-CN',
  defaultWorkspacePath: '',
  defaultAgentsPath: '',
  defaultSkillsPath: '',
};

describe('SettingsPanel', () => {
  it('renders all three tabs', () => {
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    // Tab labels contain the tab names
    expect(screen.getByText('daemon.tab')).toBeInTheDocument();
    expect(screen.getByText('mcp.title')).toBeInTheDocument();
    expect(screen.getByText('prefs.title')).toBeInTheDocument();
  });

  it('shows preferences panel by default', () => {
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    // Preferences panel is the first tab and should be visible
    expect(screen.getByTestId('prefs-theme')).toBeInTheDocument();
  });

  it('switches to MCP tab on click', async () => {
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    const mcpTab = screen.getByText('mcp.title');
    fireEvent.click(mcpTab);

    expect(screen.getByTestId('mcp-loadGlobal')).toBeInTheDocument();
  });

  it('switches to Preferences tab on click', async () => {
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    const prefsTab = screen.getByText('prefs.title');
    fireEvent.click(prefsTab);

    expect(screen.getByTestId('prefs-theme')).toBeInTheDocument();
  });

  it('renders tab icons', () => {
    const { container } = render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    // Each tab has an SVG icon
    const svgs = container.querySelectorAll('.ant-tabs-tab svg');
    expect(svgs.length).toBe(3);
  });

  it('calls onPreferencesSubmit when preferences submit button is clicked', () => {
    const onSubmit = vi.fn();
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={onSubmit}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('common.submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(preferences);
  });

  it('calls onPreferencesReset when preferences reset button is clicked', () => {
    const onReset = vi.fn();
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        onPreferencesReset={onReset}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('common.reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onDaemonConfigSubmit when daemon submit button is clicked', () => {
    const onSubmit = vi.fn();
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={onSubmit}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('daemon.tab'));
    fireEvent.click(screen.getByText('common.submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(daemonConfig);
  });

  it('calls onDaemonConfigReset when daemon reset button is clicked', () => {
    const onReset = vi.fn();
    render(
      <SettingsPanel
        daemonConfig={daemonConfig}
        onDaemonConfigSubmit={() => {}}
        onDaemonConfigReset={onReset}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesSubmit={() => {}}
      />,
      { wrapper }
    );

    fireEvent.click(screen.getByText('daemon.tab'));
    fireEvent.click(screen.getByText('common.reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
