/** @jsxImportSource @emotion/react */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMessage } from './UserMessage.js';
import { AssistantMessage } from './AssistantMessage.js';
import { SystemMessage } from './SystemMessage.js';
import { MessageWrapper } from './MessageWrapper.js';
import type { Message } from '../types.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 600 }}>{children}</div>;
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

export const AssistantTyping: Story = {
  render: () => {
    const msg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
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

// ---- Message Actions Mockup ----

const actionHandlers = {
  onCopy: (m: Message) => console.log('copy', m.id),
  onEdit: (m: Message) => console.log('edit', m.id),
  onRegenerate: (m: Message) => console.log('regenerate', m.id),
  onRollback: (m: Message) => console.log('rollback', m.id),
  onFork: (m: Message) => console.log('fork', m.id),
};

export const UserWithHoverActions: Story = {
  render: () => (
    <Wrapper>
      <MessageWrapper message={userMsg} isLastUserMessage {...actionHandlers}>
        <UserMessage message={userMsg} />
      </MessageWrapper>
    </Wrapper>
  ),
};

export const AssistantWithHoverActions: Story = {
  render: () => {
    const msg: Message = {
      id: '7',
      role: 'assistant',
      content: 'hover 这条消息，你会看到底部浮现的操作栏。默认隐藏，hover 时淡入。',
      status: 'completed',
    };
    return (
      <Wrapper>
        <MessageWrapper message={msg} isLastCompletedAssistant {...actionHandlers}>
          <AssistantMessage message={msg} />
        </MessageWrapper>
      </Wrapper>
    );
  },
};

export const AssistantStreamingWithActions: Story = {
  render: () => {
    const msg: Message = {
      id: '8',
      role: 'assistant',
      content: 'streaming 状态下不渲染任何操作按钮，等回答完成后才会出现。',
      status: 'streaming',
    };
    return (
      <Wrapper>
        <MessageWrapper message={msg} {...actionHandlers}>
          <AssistantMessage message={msg} />
        </MessageWrapper>
      </Wrapper>
    );
  },
};

export const ConversationWithActions: Story = {
  render: () => {
    const messages: Message[] = [
      {
        id: 'c1',
        role: 'user',
        content: '帮我分析一下这段代码的性能瓶颈',
        status: 'completed',
      },
      {
        id: 'c2',
        role: 'assistant',
        content:
          '从代码结构来看，主要有以下几个潜在的性能瓶颈：\n\n1. **循环嵌套** — 第 23 行的双重循环时间复杂度为 O(n²)，当数据量增大时会显著拖慢执行速度。\n\n2. **重复计算** — `calculateExpensiveValue` 在每次迭代都被调用，建议缓存结果或使用 memoization。\n\n3. **DOM 操作** — 直接在循环中修改 DOM 会触发多次重排，建议使用 DocumentFragment 批量更新。',
        status: 'completed',
      },
      {
        id: 'c3',
        role: 'user',
        content: '那怎么优化第一个问题？',
        status: 'completed',
      },
      {
        id: 'c4',
        role: 'assistant',
        content: '可以用哈希表将内层循环的查找降为 O(1)，整体降到 O(n)。需要我给出具体实现吗？',
        status: 'completed',
      },
    ];
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const lastCompletedAssistant = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant' && m.status === 'completed');
    return (
      <Wrapper>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((m) => (
            <MessageWrapper
              key={m.id}
              message={m}
              isLastUserMessage={m.id === lastUser?.id}
              isLastCompletedAssistant={m.id === lastCompletedAssistant?.id}
              {...actionHandlers}
            >
              {m.role === 'user' ? <UserMessage message={m} /> : <AssistantMessage message={m} />}
            </MessageWrapper>
          ))}
        </div>
      </Wrapper>
    );
  },
};

// ---- UI Variant Mockups ----

export const FooterWithMeta: Story = {
  render: () => {
    const msg: Message = {
      id: 'f1',
      role: 'assistant',
      content: '页脚行内布局：meta 小字在左，ghost 按钮 hover 渐显在行尾，与气泡互不遮挡。',
      status: 'completed',
      createdAt: Date.now(),
      usage: {
        inputTokens: 1872,
        outputTokens: 412,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        durationMs: 7000,
      },
    };
    return (
      <Wrapper>
        <MessageWrapper
          message={msg}
          {...actionHandlers}
          messageMeta={(m) => (
            <span>
              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}
              {m.usage
                ? ` · ${Math.round(m.usage.durationMs / 1000)}s · ↑${m.usage.inputTokens} ↓${m.usage.outputTokens}`
                : ''}
            </span>
          )}
        >
          <AssistantMessage message={msg} />
        </MessageWrapper>
      </Wrapper>
    );
  },
};

export const FooterActionsOnly: Story = {
  render: () => {
    const msg: Message = {
      id: 'f2',
      role: 'assistant',
      content:
        'Ghost：无容器背景，纯图标，无外轮廓。不传 messageMeta 的宿主只看到 hover 渐显按钮。',
      status: 'completed',
    };
    return (
      <Wrapper>
        <MessageWrapper message={msg} {...actionHandlers}>
          <AssistantMessage message={msg} />
        </MessageWrapper>
      </Wrapper>
    );
  },
};
