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

/** Default state with a single provider. */
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
      llm: { providers: [{ name: '', apiKey: '', models: [{ modelId: '' }] }] },
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
        providers: [
          {
            name: 'deepseek',
            apiKey: 'sk-xxxxxxxx',
            baseUrl: 'https://api.deepseek.com/v1',
            models: [
              {
                modelId: 'deepseek-chat',
                contextWindow: 64000,
                maxTokens: 8192,
                reasoning: false,
              },
            ],
          },
        ],
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

/** Multiple providers with several models each. */
export const MultiProvider: Story = {
  render: (args) => {
    const [value, setValue] = useState<DaemonConfig>({
      llm: {
        providers: [
          {
            name: 'openai',
            apiKey: 'sk-openai',
            baseUrl: 'https://api.openai.com/v1',
            models: [{ modelId: 'gpt-4o' }, { modelId: 'gpt-4o-mini' }],
          },
          {
            name: 'anthropic',
            apiKey: 'sk-anthropic',
            baseUrl: 'https://api.anthropic.com/v1',
            models: [{ modelId: 'claude-3-5-sonnet' }],
          },
        ],
      },
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
