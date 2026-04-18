/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMessage } from './UserMessage.js';
import { AssistantMessage } from './AssistantMessage.js';
import { SystemMessage } from './SystemMessage.js';
import { MessageWrapper } from './MessageWrapper.js';
import { ChatContext } from '../context.js';
import type { Message } from '../types.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ maxWidth: 600 }}>{children}</div>
    </ChatContext.Provider>
  );
}

const meta: Meta<typeof UserMessage> = {
  title: 'Chat/Messages',
  component: UserMessage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const userMsg: Message = {
  id: '1',
  role: 'user',
  content: '你好，请帮我写一段代码',
  status: 'completed',
};

// ---- UserMessage ----

export const UserDefault: Story = {
  render: () => (
    <Wrapper>
      <UserMessage message={userMsg} />
    </Wrapper>
  ),
};

// ---- AssistantMessage ----

export const AssistantDefault: Story = {
  render: () => {
    const msg: Message = {
      id: '2',
      role: 'assistant',
      content: '这是一条 AI 助手的回复消息，支持多行文本。\n第二行内容。',
      status: 'completed',
    };
    return (
      <Wrapper>
        <AssistantMessage message={msg} />
      </Wrapper>
    );
  },
};

export const AssistantStreaming: Story = {
  render: () => {
    const msg: Message = {
      id: '3',
      role: 'assistant',
      content: '正在生成回复...',
      status: 'streaming',
    };
    return (
      <Wrapper>
        <AssistantMessage message={msg} />
      </Wrapper>
    );
  },
};

export const AssistantWithBlocks: Story = {
  render: () => {
    const msg: Message = {
      id: '4',
      role: 'assistant',
      content: '分析完成，以下是结果。',
      status: 'completed',
      blocks: [
        {
          id: 'b1',
          type: 'thinking',
          status: 'completed',
          content: '让我想想...',
        },
        {
          id: 'b2',
          type: 'tool_call',
          status: 'completed',
          content: '',
          metadata: {
            toolName: 'search',
            toolType: 'mcp',
            toolArgs: '{"query": "test"}',
          },
        },
      ],
    };
    return (
      <Wrapper>
        <AssistantMessage message={msg} />
      </Wrapper>
    );
  },
};

// ---- SystemMessage ----

export const SystemDefault: Story = {
  render: () => {
    const msg: Message = { id: '5', role: 'system', content: '会话已开始', status: 'completed' };
    return (
      <Wrapper>
        <SystemMessage message={msg} />
      </Wrapper>
    );
  },
};

// ---- MessageWrapper ----

export const WrapperUser: Story = {
  render: () => (
    <Wrapper>
      <MessageWrapper message={userMsg}>
        <UserMessage message={userMsg} />
      </MessageWrapper>
    </Wrapper>
  ),
};

export const WrapperAssistant: Story = {
  render: () => {
    const msg: Message = { id: '6', role: 'assistant', content: 'AI 回复', status: 'completed' };
    return (
      <Wrapper>
        <MessageWrapper message={msg}>
          <AssistantMessage message={msg} />
        </MessageWrapper>
      </Wrapper>
    );
  },
};
