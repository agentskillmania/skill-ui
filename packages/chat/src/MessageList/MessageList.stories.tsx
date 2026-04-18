/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageList } from './index.js';
import { ChatContext } from '../context.js';
import type { Message } from '../types.js';

function Wrapper({ messages }: { messages: Message[] }) {
  return (
    <ChatContext.Provider value={{ renderers: {} }}>
      <div style={{ height: 400, border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <MessageList messages={messages} />
      </div>
    </ChatContext.Provider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Chat/MessageList',
  component: Wrapper,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Wrapper>;

const sampleMessages: Message[] = [
  { id: '1', role: 'user', content: '你好，请介绍一下你自己', status: 'completed' },
  {
    id: '2',
    role: 'assistant',
    content: '你好！我是一个 AI 助手，可以帮助你完成各种任务。',
    status: 'completed',
  },
  { id: '3', role: 'user', content: '你能做什么？', status: 'completed' },
  {
    id: '4',
    role: 'assistant',
    content: '我可以帮你：\n- 写代码\n- 分析数据\n- 回答问题\n- 翻译文本',
    status: 'completed',
  },
  { id: '5', role: 'system', content: '会话已开始', status: 'completed' },
];

/** 消息列表 */
export const Default: Story = {
  args: {
    messages: sampleMessages,
  },
};

/** 空列表 */
export const Empty: Story = {
  args: {
    messages: [],
  },
};
