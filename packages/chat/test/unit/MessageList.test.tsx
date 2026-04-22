import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MessageList } from '../../src/MessageList/index.js';
import type { Message } from '../../src/types.js';

const messages: Message[] = [
  { id: '1', role: 'user', content: '第一条', status: 'completed' },
  { id: '2', role: 'assistant', content: '第二条', status: 'completed' },
  { id: '3', role: 'system', content: '系统消息', status: 'completed' },
];

describe('MessageList', () => {
  it('renders all messages', () => {
    render(
      <ChatWrapper>
        <MessageList messages={messages} />
      </ChatWrapper>
    );
    expect(screen.getByText('第一条')).toBeInTheDocument();
    expect(screen.getByText('第二条')).toBeInTheDocument();
    expect(screen.getByText('系统消息')).toBeInTheDocument();
  });

  it('does not crash with empty list', () => {
    render(
      <ChatWrapper>
        <MessageList messages={[]} />
      </ChatWrapper>
    );
    // just verify it does not crash
  });

  it('long list renders normally', () => {
    const long: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `m${i}`,
      role: 'user' as const,
      content: `消息 ${i}`,
      status: 'completed' as const,
    }));
    render(
      <ChatWrapper>
        <MessageList messages={long} />
      </ChatWrapper>
    );
    expect(screen.getByText('消息 0')).toBeInTheDocument();
    expect(screen.getByText('消息 49')).toBeInTheDocument();
  });
});
