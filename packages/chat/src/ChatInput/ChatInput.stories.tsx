/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ChatInput } from './index.js';
import { ChatContext } from '../context.js';

// 在 ChatContext 中包裹，提供 renderers
function ChatInputWrapper(props: React.ComponentProps<typeof ChatInput>) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600 }}>
        <ChatInput {...props} />
      </div>
    </ChatContext.Provider>
  );
}

const meta: Meta<typeof ChatInputWrapper> = {
  title: 'Chat/ChatInput',
  component: ChatInputWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ChatInputWrapper>;

/** 基础可交互 */
const BasicComponent = () => {
  const [value, setValue] = React.useState('');
  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      onSubmit={(msg) => {
        alert(`发送: ${msg}`);
        setValue('');
      }}
      placeholder="有什么可以帮你的？"
    />
  );
};

export const Basic: Story = {
  render: () => <BasicComponent />,
};

/** Loading 状态 */
const LoadingComponent = () => {
  const [value, setValue] = React.useState('正在处理中...');
  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      loading
      onCancel={() => alert('取消')}
      placeholder="正在处理..."
    />
  );
};

export const Loading: Story = {
  render: () => <LoadingComponent />,
};

/** 禁用状态 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '请先配置 LLM Provider',
  },
};

/** 带 prefix 和 suffix */
const WithAffixesComponent = () => {
  const [value, setValue] = React.useState('');
  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      onSubmit={(msg) => {
        alert(`发送: ${msg}`);
        setValue('');
      }}
      prefix={<button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📎</button>}
      suffix={<button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📤</button>}
      placeholder="输入消息..."
    />
  );
};

export const WithAffixes: Story = {
  render: () => <WithAffixesComponent />,
};
