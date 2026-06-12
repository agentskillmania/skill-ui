import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { McpConfigPanel } from './McpConfigPanel.js';
import type { McpConfig } from '../types.js';

const meta: Meta<typeof McpConfigPanel> = {
  title: 'Settings/McpConfigPanel',
  component: McpConfigPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const defaultConfig: McpConfig = {
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

/** Default state with several servers available. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<McpConfig>(defaultConfig);
    return <McpConfigPanel {...args} value={value} onChange={setValue} />;
  },
};

/** Global toggle off — server list hidden. */
export const GlobalDisabled: Story = {
  render: (args) => {
    const [value, setValue] = useState<McpConfig>({ ...defaultConfig, loadGlobal: false });
    return <McpConfigPanel {...args} value={value} onChange={setValue} />;
  },
};

/** No servers available. */
export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = useState<McpConfig>({
      loadGlobal: true,
      enabledServers: [],
      availableServers: [],
    });
    return <McpConfigPanel {...args} value={value} onChange={setValue} />;
  },
};
