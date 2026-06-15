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
        onDaemonConfigChange={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesChange={() => {}}
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
        onDaemonConfigChange={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesChange={() => {}}
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
        onDaemonConfigChange={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesChange={() => {}}
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
        onDaemonConfigChange={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesChange={() => {}}
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
        onDaemonConfigChange={() => {}}
        mcpConfig={mcpConfig}
        onMcpConfigChange={() => {}}
        preferences={preferences}
        onPreferencesChange={() => {}}
      />,
      { wrapper }
    );

    // Each tab has an SVG icon
    const svgs = container.querySelectorAll('.ant-tabs-tab svg');
    expect(svgs.length).toBe(3);
  });
});
