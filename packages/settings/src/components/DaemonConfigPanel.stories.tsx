import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DaemonConfigPanel } from './DaemonConfigPanel.js';
import type { DaemonConfig } from '../types.js';

const meta: Meta<typeof DaemonConfigPanel> = {
  title: 'Settings/DaemonConfigPanel',
  component: DaemonConfigPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const defaultConfig: DaemonConfig = {
  llm: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'sk-proj-xxxxxxxxxxxxxxxx',
    model: 'gpt-4o',
    contextWindow: null,
    maxTokens: null,
    reasoning: 'auto',
  },
  server: {
    host: 'localhost',
    port: 3100,
  },
};

/** Default state with typical values. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<DaemonConfig>(defaultConfig);
    return (
      <DaemonConfigPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/** Empty state for initial setup. */
export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = useState<DaemonConfig>({
      llm: { baseUrl: '', apiKey: '', model: '' },
      server: { host: 'localhost', port: 3100 },
    });
    return (
      <DaemonConfigPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/** Custom provider configuration (e.g. DeepSeek). */
export const DeepSeek: Story = {
  render: (args) => {
    const [value, setValue] = useState<DaemonConfig>({
      llm: {
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk-xxxxxxxx',
        model: 'deepseek-chat',
        contextWindow: 64000,
        maxTokens: 8192,
        reasoning: 'auto',
      },
      server: { host: '0.0.0.0', port: 8080 },
    });
    return (
      <DaemonConfigPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};
