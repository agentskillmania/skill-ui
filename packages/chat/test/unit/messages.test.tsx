import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
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
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

describe('AssistantMessage', () => {
  it('renders assistant message content', () => {
    render(
      <ChatWrapper>
        <AssistantMessage message={assistantMsg} />
      </ChatWrapper>
    );
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
    expect(screen.getByText('思考中...')).toBeInTheDocument();
  });
});

describe('SystemMessage', () => {
  it('renders system message content', () => {
    render(
      <ChatWrapper>
        <SystemMessage message={systemMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('System notice')).toBeInTheDocument();
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
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('routes to AssistantMessage by role', () => {
    render(
      <ChatWrapper>
        <MessageItem message={assistantMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('routes to SystemMessage by role', () => {
    render(
      <ChatWrapper>
        <MessageItem message={systemMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('uses custom message renderer', () => {
    const CustomMsg = ({ message }: { message: Message }) => <div>Custom: {message.content}</div>;
    render(
      <ChatWrapper context={{ renderers: { messages: { user: CustomMsg } } }}>
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
    expect(screen.getByText('Custom: Hello')).toBeInTheDocument();
  });

  it('applies messageDecorator', () => {
    render(
      <ChatWrapper
        context={{
          messageDecorator: (msg, el) => <div data-testid="decorated">{el}</div>,
        }}
      >
        <MessageItem message={userMsg} />
      </ChatWrapper>
    );
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
    // should render content in SystemMessage style
    expect(screen.getByText('工具输出')).toBeInTheDocument();
  });
});
