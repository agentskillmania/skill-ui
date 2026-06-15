import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsPanel } from './SettingsPanel.js';
import type { DaemonConfig, McpConfig, AppPreferences } from '../types.js';

const meta: Meta<typeof SettingsPanel> = {
  title: 'Settings/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const daemonConfig: DaemonConfig = {
  llm: {
    providers: [
      {
        name: 'openai',
        apiKey: 'sk-proj-xxxxxxxxxxxxxxxx',
        baseUrl: 'https://api.openai.com/v1',
        models: [{ modelId: 'gpt-4o' }],
      },
    ],
  },
  server: {
    host: 'localhost',
    port: 3100,
  },
};

const mcpConfig: McpConfig = {
  loadGlobal: true,
  enabledServers: ['filesystem', 'brave-search'],
  availableServers: [
    { name: 'filesystem', command: 'npx @modelcontextprotocol/server-filesystem', args: ['/home'] },
    { name: 'github', command: 'npx @modelcontextprotocol/server-github' },
    { name: 'puppeteer', command: 'npx @modelcontextprotocol/server-puppeteer' },
    { name: 'brave-search', command: 'npx @anthropic/mcp-server-brave-search' },
    { name: 'memory', command: 'npx @modelcontextprotocol/server-memory' },
  ],
};

const preferences: AppPreferences = {
  theme: 'system',
  language: 'zh-CN',
  defaultWorkspacePath: '/home/user/projects',
  defaultAgentsPath: '~/.agentskillmania/skill-studio/agents',
  defaultSkillsPath: '~/.agentskillmania/skill-studio/skills',
};

/** Full settings panel with all three tabs — browse buttons disabled (no onBrowseDirectory). */
export const Default: Story = {
  render: (args) => {
    const [daemon, setDaemon] = useState<DaemonConfig>(daemonConfig);
    const [mcp, setMcp] = useState<McpConfig>(mcpConfig);
    const [prefs, setPrefs] = useState<AppPreferences>(preferences);
    return (
      <SettingsPanel
        {...args}
        daemonConfig={daemon}
        onDaemonConfigSubmit={setDaemon}
        mcpConfig={mcp}
        onMcpConfigChange={setMcp}
        preferences={prefs}
        onPreferencesSubmit={setPrefs}
      />
    );
  },
};

/** Empty config for initial setup. */
export const EmptySetup: Story = {
  render: (args) => {
    const [daemon, setDaemon] = useState<DaemonConfig>({
      llm: { providers: [{ name: '', apiKey: '', models: [{ modelId: '' }] }] },
      server: { host: 'localhost', port: 3100 },
    });
    const [mcp, setMcp] = useState<McpConfig>({
      loadGlobal: true,
      enabledServers: [],
      availableServers: [],
    });
    const [prefs, setPrefs] = useState<AppPreferences>({
      theme: 'system',
      language: 'zh-CN',
      defaultWorkspacePath: '',
      defaultAgentsPath: '',
      defaultSkillsPath: '',
    });
    return (
      <SettingsPanel
        {...args}
        daemonConfig={daemon}
        onDaemonConfigSubmit={setDaemon}
        mcpConfig={mcp}
        onMcpConfigChange={setMcp}
        preferences={prefs}
        onPreferencesSubmit={setPrefs}
      />
    );
  },
};

/**
 * With onBrowseDirectory provided — browse buttons are enabled.
 * Simulates what an Electron consumer would pass via IPC.
 */
export const WithBrowseCallback: Story = {
  render: (args) => {
    const [daemon, setDaemon] = useState<DaemonConfig>(daemonConfig);
    const [mcp, setMcp] = useState<McpConfig>(mcpConfig);
    const [prefs, setPrefs] = useState<AppPreferences>(preferences);
    const onBrowseDirectory = useCallback(async (field: keyof AppPreferences) => {
      // In Electron: await window.studio.dialog.showOpenDialog({ properties: ['openDirectory'] })
      const label = field.replace('default', '').replace('Path', '').toLowerCase();
      return `/home/user/selected-${label}`;
    }, []);
    return (
      <SettingsPanel
        {...args}
        daemonConfig={daemon}
        onDaemonConfigSubmit={setDaemon}
        mcpConfig={mcp}
        onMcpConfigChange={setMcp}
        preferences={prefs}
        onPreferencesSubmit={setPrefs}
        onBrowseDirectory={onBrowseDirectory}
      />
    );
  },
};
