/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ChatInput } from './index.js';
import type { ChatAttachment, ChatModelOption } from '../types.js';

function ChatInputWrapper(props: React.ComponentProps<typeof ChatInput>) {
  return (
    <div style={{ maxWidth: 600 }}>
      <ChatInput {...props} />
    </div>
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

/** Basic interactive */
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

/** Disabled state */
export const Disabled: Story = {
  args: {
    value: '',
    onChange: () => {},
    disabled: true,
    placeholder: '请先配置 LLM Provider',
  },
};

/** With prefix and suffix */
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

/** 工具条：快捷指令 + 模型选择 + 思考 + 上下文占用 */
const ToolbarComponent = () => {
  const [value, setValue] = React.useState('');
  const [model, setModel] = React.useState<ChatModelOption>({ id: 'gpt-4o', label: 'GPT-4o' });
  const [thinking, setThinking] = React.useState<boolean | null>(null);

  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      onSubmit={(msg) => {
        alert(`发送: ${msg}`);
        setValue('');
      }}
      placeholder="输入 / 试试命令补全"
      commands={[
        { id: 'search', label: '搜索', command: 'search' },
        { id: 'analyze', label: '分析', command: 'analyze' },
        { id: 'new', label: '新建', command: 'new' },
      ]}
      onCommand={(cmd) => {
        alert(`命令: ${cmd.label}`);
        setValue('');
      }}
      models={[
        {
          key: 'openai',
          label: 'OpenAI',
          models: [
            { id: 'gpt-4o', label: 'GPT-4o' },
            { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
          ],
        },
        {
          key: 'anthropic',
          label: 'Anthropic',
          models: [
            { id: 'claude-sonnet', label: 'Claude Sonnet' },
            { id: 'claude-haiku', label: 'Claude Haiku' },
          ],
        },
      ]}
      selectedModel={model}
      onModelChange={setModel}
      thinking={thinking}
      onThinkingChange={setThinking}
      contextUsage={{ used: 12400, total: 200000 }}
    />
  );
};

export const Toolbar: Story = {
  render: () => <ToolbarComponent />,
};

/** 多模态:附件(选图/粘贴/拖拽)+ chips 展示 */
const AttachmentsComponent = () => {
  const [value, setValue] = React.useState('');
  const [attachments, setAttachments] = React.useState<ChatAttachment[]>([]);
  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      onSubmit={(msg, atts) => {
        alert(`发送: ${msg}${atts ? `(+${atts.length} 附件)` : ''}`);
        setValue('');
        setAttachments([]);
      }}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      onAttachmentsRejected={(reason, files) => {
        alert(`拒绝 ${files.length} 个文件: ${reason}`);
      }}
      placeholder="输入消息,试试粘贴或拖入图片…"
    />
  );
};

export const Attachments: Story = {
  render: () => <AttachmentsComponent />,
};

/** 全特性:多模态附件 + 命令补全 + 模型/思考/上下文 + banner + 前后缀插槽 */
const FullComponent = () => {
  const [value, setValue] = React.useState('');
  const [attachments, setAttachments] = React.useState<ChatAttachment[]>([]);
  const [model, setModel] = React.useState<ChatModelOption>({
    id: 'claude-sonnet',
    label: 'Claude Sonnet',
  });
  const [thinking, setThinking] = React.useState<boolean | null>(null);

  return (
    <ChatInputWrapper
      value={value}
      onChange={setValue}
      onSubmit={(msg, atts) => {
        alert(`发送: ${msg}${atts ? ` (+${atts.length} 个附件)` : ''}`);
        setValue('');
        setAttachments([]);
      }}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      onAttachmentsRejected={(reason, files) => {
        alert(`拒绝 ${files.length} 个文件: ${reason}`);
      }}
      commands={[
        { id: 'search', label: '搜索', command: 'search' },
        { id: 'analyze', label: '分析', command: 'analyze' },
        { id: 'new', label: '新建', command: 'new' },
      ]}
      onCommand={(cmd) => {
        alert(`执行命令: ${cmd.label}`);
        setValue('');
      }}
      models={[
        {
          key: 'openai',
          label: 'OpenAI',
          models: [
            { id: 'gpt-4o', label: 'GPT-4o' },
            { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
          ],
        },
        {
          key: 'anthropic',
          label: 'Anthropic',
          models: [
            { id: 'claude-sonnet', label: 'Claude Sonnet' },
            { id: 'claude-haiku', label: 'Claude Haiku' },
          ],
        },
      ]}
      selectedModel={model}
      onModelChange={setModel}
      thinking={thinking}
      onThinkingChange={setThinking}
      contextUsage={{ used: 38200, total: 200000 }}
      banner={
        <div style={{ fontSize: 12, color: '#999', padding: '2px 4px' }}>
          编辑历史消息中——发送将覆盖原消息(banner 插槽示例)
        </div>
      }
      prefix={<button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📎</button>}
      suffix={<button style={{ border: 'none', background: 'none', cursor: 'pointer' }}>📤</button>}
      placeholder="全特性:输入 / 唤起命令面板 · 粘贴/拖入图片 · ↑↓ 翻历史"
    />
  );
};

export const Full: Story = {
  render: () => <FullComponent />,
};
