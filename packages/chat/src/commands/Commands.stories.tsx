/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QuickCommands } from './QuickCommands.js';
import { CommandAutocomplete } from './CommandAutocomplete.js';
import type { ChatCommand } from '../types.js';
import { ChatContext } from '../context.js';

const mockCommands: ChatCommand[] = [
  {
    id: '1',
    label: '搜索',
    command: 'search',
    description: '搜索知识库',
    group: '工具',
    keywords: ['查询', 'find'],
  },
  {
    id: '2',
    label: '分析',
    command: 'analyze',
    description: '分析数据',
    group: '工具',
    keywords: ['数据'],
  },
  {
    id: '3',
    label: '新建文件',
    command: 'new',
    description: '创建新文件',
    group: '文件',
    keywords: ['创建'],
  },
  { id: '4', label: '打开文件', command: 'open', description: '打开已有文件', group: '文件' },
  { id: '5', label: '帮助', command: 'help', description: '查看帮助信息' },
  { id: '6', label: '清除', command: 'clear', description: '清除对话记录', keywords: ['清空'] },
  { id: '7', label: '导出', command: 'export', description: '导出对话', group: '文件' },
];

// ---- QuickCommands Stories ----

function QuickCommandsWrapper(props: React.ComponentProps<typeof QuickCommands>) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600 }}>
        <QuickCommands {...props} />
      </div>
    </ChatContext.Provider>
  );
}

const quickMeta: Meta<typeof QuickCommandsWrapper> = {
  title: 'Chat/QuickCommands',
  component: QuickCommandsWrapper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default quickMeta;
type QuickStory = StoryObj<typeof QuickCommandsWrapper>;

const BasicQuickComponent = () => {
  const [selected, setSelected] = React.useState<ChatCommand | null>(null);
  return (
    <>
      <QuickCommandsWrapper
        commands={mockCommands}
        onCommand={(cmd) => {
          setSelected(cmd);
          alert(`选择了: ${cmd.label}`);
        }}
      />
      {selected && <p style={{ marginTop: 8 }}>已选择: {selected.label}</p>}
    </>
  );
};

export const QuickBasic: QuickStory = {
  render: () => <BasicQuickComponent />,
};

export const QuickDisabled: QuickStory = {
  args: {
    commands: mockCommands,
    onCommand: () => {},
    disabled: true,
  },
};

const LimitedComponent = () => (
  <QuickCommandsWrapper commands={mockCommands} onCommand={() => {}} maxCommands={3} />
);

export const QuickLimited: QuickStory = {
  render: () => <LimitedComponent />,
};

// ---- CommandAutocomplete Stories ----

function AutocompleteWrapper({
  commands,
  inputValue,
  trigger,
}: {
  commands: ChatCommand[];
  inputValue: string;
  trigger?: string;
}) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600 }}>
        <CommandAutocomplete
          commands={commands}
          onCommand={(cmd) => alert(`选择了: ${cmd.label}`)}
          inputValue={inputValue}
          trigger={trigger}
        >
          <div
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
              color: '#0f172a',
            }}
          >
            输入: {inputValue || '(空)'}
          </div>
        </CommandAutocomplete>
      </div>
    </ChatContext.Provider>
  );
}

const autoMeta: Meta<typeof AutocompleteWrapper> = {
  title: 'Chat/CommandAutocomplete',
  component: AutocompleteWrapper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export { autoMeta };
type AutoStory = StoryObj<typeof AutocompleteWrapper>;

export const AutoSlash: AutoStory = {
  args: { commands: mockCommands, inputValue: '/' },
};

export const AutoSearch: AutoStory = {
  args: { commands: mockCommands, inputValue: '/se' },
};

export const AutoNoMatch: AutoStory = {
  args: { commands: mockCommands, inputValue: '/xyz' },
};

export const AutoNoTrigger: AutoStory = {
  args: { commands: mockCommands, inputValue: 'hello' },
};
