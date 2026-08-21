import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper, expandAllCollapsed } from './testUtils.js';
import { MessageItem } from '../../src/messages/MessageItem.js';
import { UserMessage } from '../../src/messages/UserMessage.js';
import { AssistantMessage } from '../../src/messages/AssistantMessage.js';
import { SystemMessage } from '../../src/messages/SystemMessage.js';
import { MessageWrapper } from '../../src/messages/MessageWrapper.js';
import type { Message } from '../../src/types.js';

const userMsg: Message = { id: '1', role: 'user', content: 'Hello', status: 'completed' };
const assistantMsg: Message = {
  id: '2',
  role: 'assistant',
  content: 'Hi there',
  status: 'completed',
};
const systemMsg: Message = {
  id: '3',
  role: 'system',
  content: 'System notice',
  status: 'completed',
};

describe('UserMessage', () => {
  it('renders user message content', () => {
    render(
      <ChatWrapper>
        <UserMessage message={userMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders empty content without crash', () => {
    const emptyMsg: Message = { id: 'e1', role: 'user', content: '', status: 'completed' };
    const { container } = render(
      <ChatWrapper>
        <UserMessage message={emptyMsg} />
      </ChatWrapper>
    );
    // Wrapper div exists, content is empty string
    expect(container.querySelector('div')).toBeInTheDocument();
    expect(container.textContent).toBe('');
  });
});

describe('AssistantMessage', () => {
  it('renders assistant message content', () => {
    render(
      <ChatWrapper>
        <AssistantMessage message={assistantMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders message with blocks', () => {
    const msg: Message = {
      ...assistantMsg,
      blocks: [{ id: 'b1', type: 'thinking', status: 'completed', content: '思考中...' }],
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('思考中...')).toBeInTheDocument();
  });

  it('does not render blocks area when blocks is empty array', () => {
    const msg: Message = { ...assistantMsg, blocks: [] };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // Content still renders, but BlocksRenderer not invoked
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('does not render content when content is empty', () => {
    const msg: Message = { id: 'ae1', role: 'assistant', content: '', status: 'completed' };
    const { container } = render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    // Wrapper exists, no text content
    expect(container.querySelector('div')).toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('shows typing indicator when streaming with empty content and no blocks', () => {
    const msg: Message = { id: 'at1', role: 'assistant', content: '', status: 'streaming' };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('AI is typing')).toBeInTheDocument();
  });

  it('does not show typing indicator when streaming but content exists', () => {
    const msg: Message = {
      id: 'at2',
      role: 'assistant',
      content: 'partial response',
      status: 'streaming',
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('partial response')).toBeInTheDocument();
  });

  it('does not show typing indicator when streaming with blocks but no content', () => {
    const msg: Message = {
      id: 'at3',
      role: 'assistant',
      content: '',
      status: 'streaming',
      blocks: [{ id: 'b1', type: 'thinking', status: 'streaming', content: 'thinking...' }],
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // Blocks render, typing indicator should NOT appear
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not show typing indicator when completed with empty content', () => {
    const msg: Message = { id: 'at4', role: 'assistant', content: '', status: 'completed' };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('passes streaming prop when status is streaming', () => {
    const msg: Message = {
      id: 'as1',
      role: 'assistant',
      content: '加载中...',
      status: 'streaming',
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // Content renders with streaming enabled
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('renders blocks and content together', () => {
    const msg: Message = {
      ...assistantMsg,
      blocks: [{ id: 'b1', type: 'thinking', status: 'completed', content: '思考中...' }],
    };
    render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('思考中...')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders text blocks inline in chronological position, without duplicating content', () => {
    // Text-as-block: prose segments live in the blocks array; the derived
    // `content` (their concatenation) must NOT render again at the bottom.
    const msg: Message = {
      id: 'tb1',
      role: 'assistant',
      content: '我先查一下结论如下',
      status: 'completed',
      blocks: [
        { id: 'k1', type: 'thinking', status: 'completed', content: '思考A' },
        { id: 'k2', type: 'text', status: 'completed', content: '我先查一下' },
        {
          id: 'k3',
          type: 'tool_call',
          status: 'completed',
          content: '',
          metadata: { toolName: 'search', toolArgs: '{}', toolResult: 'ok' },
        },
        { id: 'k4', type: 'thinking', status: 'completed', content: '思考B' },
        { id: 'k5', type: 'text', status: 'completed', content: '结论如下' },
      ],
    };
    const { container } = render(
      <ChatWrapper>
        <AssistantMessage message={msg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    const text = container.textContent ?? '';
    // Each prose segment exactly once (no content fallback duplication)
    expect(text.match(/我先查一下/g)).toHaveLength(1);
    expect(text.match(/结论如下/g)).toHaveLength(1);
    // Chronological order: 思考A < 我先查一下 < search < 思考B < 结论如下
    const order = ['思考A', '我先查一下', 'search', '思考B', '结论如下'].map((s) =>
      text.indexOf(s)
    );
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

describe('SystemMessage', () => {
  it('renders system message content', () => {
    render(
      <ChatWrapper>
        <SystemMessage message={systemMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('renders empty content without crash', () => {
    const emptyMsg: Message = { id: 'se1', role: 'system', content: '', status: 'completed' };
    const { container } = render(
      <ChatWrapper>
        <SystemMessage message={emptyMsg} />
      </ChatWrapper>
    );
    expect(container.querySelector('div')).toBeInTheDocument();
    expect(container.textContent).toBe('');
  });
});

describe('MessageWrapper', () => {
  it('renders children', () => {
    render(
      <ChatWrapper>
        <MessageWrapper message={userMsg}>
          <span>子内容</span>
        </MessageWrapper>
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('子内容')).toBeInTheDocument();
  });
});

describe('MessageItem', () => {
  it('routes to UserMessage by role', () => {
    render(
      <ChatWrapper>
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('routes to AssistantMessage by role', () => {
    render(
      <ChatWrapper>
        <MessageItem message={assistantMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('routes to SystemMessage by role', () => {
    render(
      <ChatWrapper>
        <MessageItem message={systemMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('uses custom message renderer', () => {
    const CustomMsg = ({ message }: { message: Message }) => <div>Custom: {message.content}</div>;
    render(
      <ChatWrapper>
        <MessageItem message={userMsg} renderers={{ messages: { user: CustomMsg } }} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByText('Custom: Hello')).toBeInTheDocument();
  });

  it('applies messageDecorator', () => {
    render(
      <ChatWrapper>
        <MessageItem
          message={userMsg}
          messageDecorator={(_msg, el) => <div data-testid="decorated">{el}</div>}
        />
      </ChatWrapper>
    );
    expandAllCollapsed();
    expect(screen.getByTestId('decorated')).toBeInTheDocument();
  });

  it('unrecognized role falls back to SystemMessage', () => {
    // use role not in built-in mapping (e.g. "tool") to trigger else branch
    const unknownMsg: Message = { id: '4', role: 'tool', content: '工具输出', status: 'completed' };
    render(
      <ChatWrapper>
        <MessageItem message={unknownMsg} />
      </ChatWrapper>
    );
    expandAllCollapsed();
    // should render content in SystemMessage style
    expect(screen.getByText('工具输出')).toBeInTheDocument();
  });
});
