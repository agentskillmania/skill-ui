import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreferencesPanel } from './PreferencesPanel.js';
import type { AppPreferences } from '../types.js';

const meta: Meta<typeof PreferencesPanel> = {
  title: 'Settings/PreferencesPanel',
  component: PreferencesPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const defaultPrefs: AppPreferences = {
  theme: 'system',
  language: 'zh-CN',
  defaultWorkspacePath: '/home/user/projects',
  defaultAgentsPath: '~/.agentskillmania/skill-studio/agents',
  defaultSkillsPath: '~/.agentskillmania/skill-studio/skills',
};

/** Default preferences — browse buttons disabled (no onBrowseDirectory). */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<AppPreferences>(defaultPrefs);
    return (
      <PreferencesPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/** Light theme explicitly selected. */
export const LightTheme: Story = {
  render: (args) => {
    const [value, setValue] = useState<AppPreferences>({ ...defaultPrefs, theme: 'light' });
    return (
      <PreferencesPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/** Dark theme selected, English language. */
export const DarkEnglish: Story = {
  render: (args) => {
    const [value, setValue] = useState<AppPreferences>({
      ...defaultPrefs,
      theme: 'dark',
      language: 'en-US',
    });
    return (
      <PreferencesPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/** Empty directory paths. */
export const EmptyPaths: Story = {
  render: (args) => {
    const [value, setValue] = useState<AppPreferences>({
      ...defaultPrefs,
      defaultWorkspacePath: '',
      defaultAgentsPath: '',
      defaultSkillsPath: '',
    });
    return (
      <PreferencesPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
      />
    );
  },
};

/**
 * With a browse callback provided (simulates Electron IPC).
 * In production, the consumer passes `dialog.showOpenDialog` via IPC here.
 */
export const WithBrowseCallback: Story = {
  render: (args) => {
    const [value, setValue] = useState<AppPreferences>(defaultPrefs);
    const onBrowseDirectory = useCallback(async (field: keyof AppPreferences) => {
      // In a real Electron app this would be:
      //   const result = await window.studio.dialog.showOpenDialog({
      //     properties: ['openDirectory'],
      //     title: `Select ${field}`,
      //   });
      //   return result.filePaths[0];
      //
      // Here we simulate the user picking a directory:
      const fieldLabel = field.replace('default', '').replace('Path', '').toLowerCase();
      return `/home/user/selected-${fieldLabel}`;
    }, []);
    return (
      <PreferencesPanel
        {...args}
        value={value}
        onChange={(partial) => setValue((prev) => ({ ...prev, ...partial }))}
        onBrowseDirectory={onBrowseDirectory}
      />
    );
  },
};
