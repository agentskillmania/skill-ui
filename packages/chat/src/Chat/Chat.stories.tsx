/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Chat } from './index.js';
import type { Message } from '../types.js';

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
