/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Chat } from './index.js';
import type { Message, ChatCommand } from '../types.js';

const commands: ChatCommand[] = [
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
    description: '分析代码或数据',
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
  { id: '5', label: '导出', command: 'export', description: '导出对话记录', group: '文件' },
  { id: '6', label: '帮助', command: 'help', description: '查看帮助信息' },
  { id: '7', label: '清除', command: 'clear', description: '清除当前对话', keywords: ['清空'] },
];

const meta: Meta<typeof Chat> = {
  title: 'Chat/Chat',
  component: Chat,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Chat>;

/** 空消息列表 */
export const Empty: Story = {
  args: {
    messages: [],
    status: 'idle',
    placeholder: '输入消息...',
  },
};

/** 带消息历史 */
const WithMessagesComponent = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: '1', role: 'user', content: '你好', status: 'completed' },
    { id: '2', role: 'assistant', content: '你好！有什么可以帮助你的？', status: 'completed' },
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'streaming' | 'error'>('idle');

  const handleSendMessage = (content: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'completed',
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setStatus('streaming');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `收到: "${content}"`,
          status: 'completed',
          createdAt: Date.now(),
        },
      ]);
      setStatus('idle');
    }, 1000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Chat
        messages={messages}
        status={status}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onStop={() => setStatus('idle')}
      />
    </div>
  );
};

export const WithMessages: Story = {
  render: () => <WithMessagesComponent />,
};

/** 流式输出状态 */
const StreamingComponent = () => {
  const messages: Message[] = [
    { id: '1', role: 'user', content: '写一段代码', status: 'completed' },
    {
      id: '2',
      role: 'assistant',
      content: '正在为你生成代码...',
      status: 'streaming',
    },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Chat
        messages={messages}
        status="streaming"
        inputValue=""
        onSendMessage={() => {}}
        onStop={() => alert('停止')}
      />
    </div>
  );
};

export const Streaming: Story = {
  render: () => <StreamingComponent />,
};

/** 带 blocks 的完整示例 */
const WithBlocksComponent = () => {
  const messages: Message[] = [
    { id: '1', role: 'user', content: '帮我分析一下项目结构', status: 'completed' },
    {
      id: '2',
      role: 'assistant',
      content: '分析完成，这是项目结构概览：\n- src/\n  - index.ts\n  - utils/',
      status: 'completed',
      blocks: [
        {
          id: 'b1',
          type: 'thinking',
          status: 'completed',
          content: '用户想要了解项目结构，我需要先读取文件目录...',
        },
        {
          id: 'b2',
          type: 'tool_call',
          status: 'completed',
          content: '',
          metadata: {
            toolName: 'read_directory',
            toolType: 'mcp',
            toolArgs: '{"path": "/project/src"}',
            toolResult: 'index.ts\nutils/',
          },
        },
      ],
    },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Chat
        messages={messages}
        status="idle"
        inputValue=""
        onSendMessage={(msg) => alert(`发送: ${msg}`)}
      />
    </div>
  );
};

export const WithBlocks: Story = {
  render: () => <WithBlocksComponent />,
};

/** 快捷指令 + 斜杠自动补全 */
const WithCommandsComponent = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'streaming' | 'error'>('idle');

  const handleCommand = (cmd: ChatCommand) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `/${cmd.command}`,
      status: 'completed',
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setStatus('streaming');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `已执行指令「${cmd.label}」(${cmd.command})`,
          status: 'completed',
          createdAt: Date.now(),
        },
      ]);
      setStatus('idle');
    }, 800);
  };

  const handleSendMessage = (content: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'completed',
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setStatus('streaming');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `收到: "${content}"`,
          status: 'completed',
          createdAt: Date.now(),
        },
      ]);
      setStatus('idle');
    }, 1000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Chat
        messages={messages}
        status={status}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onStop={() => setStatus('idle')}
        commands={commands}
        onCommand={handleCommand}
        maxQuickCommands={5}
        placeholder="输入消息，或输入 / 触发指令..."
      />
    </div>
  );
};

export const WithCommands: Story = {
  render: () => <WithCommandsComponent />,
};
